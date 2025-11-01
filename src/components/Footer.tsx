import { Link } from 'react-router-dom';
import { Mail, Twitter, Instagram, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background py-12 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Coluna 1: Logo e Descrição */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-bold">
              Conversio Studio
            </Link>
            <p className="text-sm text-muted-foreground">
              Transforme suas ideias em anúncios incríveis com o poder da IA.
            </p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className="space-y-3">
            <h4 className="font-semibold">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <a href="#modelos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Modelos
                </a>
              </li>
              <li>
                <a href="#galeria" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Galeria
                </a>
              </li>
              <li>
                <a href="#recursos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#precos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Preços
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Ajuda e Suporte */}
          <div className="space-y-3">
            <h4 className="font-semibold">Ajuda & Suporte</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Serviço
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Redes Sociais */}
          <div className="space-y-3">
            <h4 className="font-semibold">Siga-nos</h4>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors hover:scale-110">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Conversio Studio. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;