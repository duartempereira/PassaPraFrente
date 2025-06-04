import { Bell, Check } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../lib/utils";

export const NotificationCard = ({ notification, onMarkAsRead }) => {
    
    const navigate = useNavigate();

    return (
        <div
            className={`mb-4 p-4 rounded-lg border ${
                notification.Lida ? "bg-white border-gray-200" : "bg-[#f5f7e8] border-[#7b892f]"
            } shadow-sm transition-all hover:shadow-md`}
        >
            <ToastContainer />
            <div className="flex items-start">
                <div className="mr-3 mt-1">
                    <Bell className={`h-5 w-5 ${notification.Lida ? "text-gray-400" : "text-[#7b892f]"}`} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <p className={`font-medium ${notification.Lida ? "text-txtp" : "text-[#7b892f]"}`}>
                            <button onClick={() => notification.Lida ? toast.warn("Nenhum link disponivel") : navigate(notification.Link)} className="hover:underline cursor-pointer bg-transparent border-none p-0 text-left">
                            {notification.Mensagem}
                            </button>
                        </p>
                        {!notification.Lida && onMarkAsRead && (
                            <button
                                onClick={() => {onMarkAsRead(notification.Notificacao_ID);}}
                                className="ml-2 p-1 text-[#7b892f] hover:bg-[#f0f2e0] rounded-full"
                                title="Marcar como lida"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(notification.Data)}</p>
                </div>
            </div>
        </div>
    );
};

export const NotificationList = ({ notifications, onMarkAsRead }) => {
    if (!notifications || notifications.length === 0) {
        return <p className="text-[#7b892f] font-semibold text-lg text-center py-8">Sem Notificações</p>;
    }

    return (
        <div className="space-y-2">
            {notifications.map((notification) => (
                <NotificationCard key={notification.Notificacao_ID} notification={notification} onMarkAsRead={onMarkAsRead} />
            ))}
        </div>
    );
};
