import adExample1 from "@/assets/ad-example-1.jpg";
import adExample2 from "@/assets/ad-example-2.jpg";
import adExample3 from "@/assets/ad-example-3.jpg";
import adExample4 from "@/assets/ad-example-4.jpg";
import community1 from "@/assets/community-1.jpg";
import community2 from "@/assets/community-2.jpg";
import community3 from "@/assets/community-3.jpg";
import community4 from "@/assets/community-4.jpg";

const images = [
  adExample1,
  community1,
  adExample2,
  community2,
  adExample3,
  community3,
  adExample4,
  community4,
];

const CommunityGallery = () => {
  return (
    <section id="galeria" className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Explore as criações da nossa comunidade
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div 
              key={index}
              className="relative group overflow-hidden rounded-xl aspect-[4/5] hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <img 
                src={image} 
                alt={`Community creation ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-sm font-semibold">Ver detalhes</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommunityGallery;
