import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Economizei horas na criação de anúncios. O que antes levava dias, agora faço em minutos!",
    author: "Maria Silva",
    role: "Gerente de Marketing",
  },
  {
    quote: "A IA do Conversio Studio entende meu estilo e gera exatamente o que eu preciso.",
    author: "João Santos",
    role: "Designer Freelancer",
  },
  {
    quote: "Em minutos, tenho posts prontos para todas as redes sociais dos meus clientes.",
    author: "Ana Costa",
    role: "Diretora de Agência",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="recursos" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          O que nossos clientes dizem
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-8 bg-card border-border relative"
            >
              <Quote className="w-10 h-10 text-primary/30 mb-4" />
              <p className="text-lg mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-bold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;