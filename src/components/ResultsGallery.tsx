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
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div 
              key={index}
              className="relative group overflow-hidden rounded-xl aspect-[4/5] hover:scale-105 transition-transform duration-300"
            >
              <img 
                src={image} 
                alt={`Ad Example ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsGallery;
