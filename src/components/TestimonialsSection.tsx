import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Economizei horas na criação de anúncios. O que antes levava dias, agora faço em minutos!",
    author: "Maria Silva",
    role: "Gerente de Marketing",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
  },
  {
    quote: "A IA do Conversio Studio entende meu estilo e gera exatamente o que eu preciso. É incrível!",
    author: "João Santos",
    role: "Designer Freelancer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
  },
  {
    quote: "Em minutos, tenho posts prontos para todas as redes sociais dos meus clientes. A produtividade da minha agência aumentou 3x.",
    author: "Ana Costa",
    role: "Diretora de Agência",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop"
  },
  {
    quote: "A qualidade das imagens geradas é impressionante. Meus anúncios nunca tiveram uma performance tão boa.",
    author: "Pedro Lima",
    role: "Empreendedor Digital",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
  },
  {
    quote: "Uma ferramenta indispensável para qualquer profissional de marketing que queira se destacar no mercado.",
    author: "Carla Mendes",
    role: "Especialista em Social Media",
    avatar: "https://images.unsplash.com/photo-1523824921871-d6f1a15141f1?w=400&h=400&fit=crop"
  },
  {
    quote: "O suporte é fantástico e a plataforma está sempre evoluindo. Recomendo a todos os meus colegas.",
    author: "Lucas Oliveira",
    role: "Consultor de E-commerce",
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop"
  },
];

const TestimonialsSection = () => {
  return (
    <section id="recursos" className="py-20 px-4 bg-card/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            O que nossos <span className="gradient-text">clientes dizem</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Histórias reais de quem já está transformando seus negócios com a gente.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-8 bg-card border-border relative flex flex-col group hover:border-primary/50 transition-all duration-300 hover:-translate-y-2"
            >
              <Quote className="w-12 h-12 text-primary/20 mb-6 transition-colors duration-300 group-hover:text-primary/40" />
              <p className="text-lg mb-6 italic flex-grow text-foreground/90">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border/50">
                <img src={testimonial.avatar} alt={testimonial.author} className="w-14 h-14 rounded-full object-cover border-2 border-primary/50" />
                <div>
                  <p className="font-bold text-lg">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;