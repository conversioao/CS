import adExample1 from "@/assets/ad-example-1.jpg";
import adExample2 from "@/assets/ad-example-2.jpg";
import adExample3 from "@/assets/ad-example-3.jpg";
import adExample4 from "@/assets/ad-example-4.jpg";

const images = [adExample1, adExample2, adExample3, adExample4];

const ResultsGallery = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Resultados gerados com IA do Conversio Studio
        </h2>
        
        <div className="columns-2 md:columns-4 gap-6 space-y-6">
          {images.map((image, index) => (
            <div 
              key={index}
              className="overflow-hidden rounded-xl break-inside-avoid group"
            >
              <img 
                src={image} 
                alt={`Ad Example ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsGallery;