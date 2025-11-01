import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const NotificationBell = () => {
  // Mock data for notifications
  const notifications = [
    { id: 1, text: "Pagamento de João Silva aprovado.", time: "2 min atrás" },
    { id: 2, text: "Novo usuário cadastrado: Maria Costa.", time: "15 min atrás" },
    { id: 3, text: "Você tem 3 pagamentos pendentes.", time: "1 hora atrás" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notificações</h4>
            <p className="text-sm text-muted-foreground">
              Você tem {notifications.length} novas mensagens.
            </p>
          </div>
          <div className="grid gap-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.text}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;