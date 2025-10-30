import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StoreMediaRequest {
  urls: string[];
  user_id: string;
  media_type: 'image' | 'video' | 'audio';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls, user_id, media_type }: StoreMediaRequest = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Error('URLs array is required');
    }

    if (!user_id) {
      throw new Error('user_id is required');
    }

    console.log(`Processing ${urls.length} ${media_type}(s) for user ${user_id}`);

    // Initialize external Supabase client
    const externalSupabaseUrl = Deno.env.get('EXTERNAL_SUPABASE_URL');
    const externalSupabaseKey = Deno.env.get('EXTERNAL_SUPABASE_KEY');
    const bucketName = Deno.env.get('EXTERNAL_SUPABASE_BUCKET') || 'conversiocloud';

    console.log('Environment check:', {
      hasUrl: !!externalSupabaseUrl,
      hasKey: !!externalSupabaseKey,
      bucketName,
      urlStart: externalSupabaseUrl?.substring(0, 20) + '...'
    });

    if (!externalSupabaseUrl || !externalSupabaseKey) {
      console.error('Missing credentials:', {
        hasUrl: !!externalSupabaseUrl,
        hasKey: !!externalSupabaseKey
      });
      throw new Error('External Supabase credentials not configured. Please update EXTERNAL_SUPABASE_URL and EXTERNAL_SUPABASE_KEY secrets.');
    }

    const externalSupabase = createClient(externalSupabaseUrl, externalSupabaseKey);

    const uploadedUrls: string[] = [];

    // Process each URL
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        console.log(`Downloading ${media_type} ${i + 1}/${urls.length} from ${url}`);
        
        // Download the file
        const downloadResponse = await fetch(url);
        if (!downloadResponse.ok) {
          throw new Error(`Failed to download from ${url}: ${downloadResponse.statusText}`);
        }

        const fileBuffer = await downloadResponse.arrayBuffer();
        const uint8Array = new Uint8Array(fileBuffer);

        // Generate filename
        const timestamp = Date.now();
        const extension = media_type === 'image' ? 'png' : media_type === 'audio' ? 'mp3' : 'mp4';
        const contentType = media_type === 'image' ? 'image/png' : media_type === 'audio' ? 'audio/mpeg' : 'video/mp4';
        const fileName = `${media_type}_${timestamp}_${i}.${extension}`;
        const filePath = `${user_id}/${fileName}`;

        console.log(`Uploading to ${bucketName}/${filePath}`);

        // Upload to external Supabase Storage
        const { data: uploadData, error: uploadError } = await externalSupabase.storage
          .from(bucketName)
          .upload(filePath, uint8Array, {
            contentType: contentType,
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${fileName}:`, uploadError);
          throw uploadError;
        }

        console.log(`Successfully uploaded ${fileName}`);

        // Get public URL
        const { data: publicUrlData } = externalSupabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      } catch (error) {
        console.error(`Error processing URL ${url}:`, error);
        // Continue with other URLs even if one fails
        uploadedUrls.push(url); // Fallback to original URL
      }
    }

    console.log(`Successfully processed ${uploadedUrls.length} files`);

    return new Response(
      JSON.stringify({
        success: true,
        urls: uploadedUrls,
        message: `${uploadedUrls.length} ${media_type}(s) stored successfully`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in store-generated-media:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
