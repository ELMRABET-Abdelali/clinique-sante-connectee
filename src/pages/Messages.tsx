
import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Message as MessageType, Role } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Plus, MessageSquare, Trash2, Send, User, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const Messages = () => {
  const { messages, users, addMessage, markMessageAsRead, deleteMessage } = useData();
  const { currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  
  // Filtrer les utilisateurs qui peuvent être des destinataires (admin, médecins et secrétaires)
  const potentialRecipients = users.filter(user => 
    user.id !== currentUser?.id && 
    user.role !== 'patient'
  );
  
  // Organiser les messages par conversations
  const conversations = messages.reduce<Record<string, MessageType[]>>((acc, message) => {
    if (message.expediteurId === currentUser?.id || message.destinataireId === currentUser?.id) {
      const otherPersonId = message.expediteurId === currentUser?.id 
        ? message.destinataireId 
        : message.expediteurId;
      
      if (!acc[otherPersonId]) {
        acc[otherPersonId] = [];
      }
      
      acc[otherPersonId].push(message);
    }
    return acc;
  }, {});
  
  // Pour chaque conversation, trier les messages par date
  Object.keys(conversations).forEach(key => {
    conversations[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });
  
  // Filtrer les conversations en fonction du terme de recherche
  const filteredConversations = Object.entries(conversations)
    .filter(([userId, _]) => {
      const user = users.find(u => u.id === userId);
      if (!user) return false;
      
      const fullName = `${user.prenom} ${user.nom}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    })
    .sort(([_, messagesA], [__, messagesB]) => {
      // Trier les conversations par date du dernier message
      const lastMessageA = messagesA[messagesA.length - 1];
      const lastMessageB = messagesB[messagesB.length - 1];
      return new Date(lastMessageB.date).getTime() - new Date(lastMessageA.date).getTime();
    });
  
  // Marquer les messages comme lus lorsqu'on ouvre une conversation
  useEffect(() => {
    if (activeConversation && conversations[activeConversation]) {
      conversations[activeConversation].forEach(message => {
        if (message.destinataireId === currentUser?.id && !message.lu) {
          markMessageAsRead(message.id);
        }
      });
    }
  }, [activeConversation, conversations, currentUser?.id, markMessageAsRead]);
  
  const handleSendMessage = () => {
    if (!selectedRecipient || !messageContent || !currentUser) {
      toast.error("Veuillez sélectionner un destinataire et saisir un message");
      return;
    }
    
    const newMessage: MessageType = {
      id: `msg-${Date.now()}`,
      expediteurId: currentUser.id,
      destinataireId: selectedRecipient,
      date: new Date().toISOString(),
      contenu: messageContent,
      lu: false
    };
    
    addMessage(newMessage);
    setIsComposeOpen(false);
    setSelectedRecipient('');
    setMessageContent('');
    
    // Si c'est une nouvelle conversation, l'activer
    setActiveConversation(selectedRecipient);
    
    toast.success("Message envoyé avec succès");
  };
  
  const handleSendReply = () => {
    if (!activeConversation || !newMessageText || !currentUser) {
      toast.error("Veuillez saisir un message");
      return;
    }
    
    const newMessage: MessageType = {
      id: `msg-${Date.now()}`,
      expediteurId: currentUser.id,
      destinataireId: activeConversation,
      date: new Date().toISOString(),
      contenu: newMessageText,
      lu: false
    };
    
    addMessage(newMessage);
    setNewMessageText('');
    toast.success("Message envoyé");
  };
  
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
    toast.success("Message supprimé");
  };
  
  const getUserName = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.prenom} ${user.nom}` : 'Utilisateur inconnu';
  };
  
  const getUserRole = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    if (!user) return '';
    
    switch (user.role) {
      case 'admin': return 'Administrateur';
      case 'secretaire': return 'Secrétaire';
      case 'medecin': return 'Médecin';
      case 'patient': return 'Patient';
      default: return user.role;
    }
  };
  
  const formatMessageDate = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${format(messageDate, 'HH:mm')}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return `Hier à ${format(messageDate, 'HH:mm')}`;
    } else {
      return format(messageDate, 'dd MMM yyyy à HH:mm', { locale: fr });
    }
  };
  
  // Compter le nombre de messages non lus
  const unreadCount = Object.values(conversations).reduce((count, messages) => {
    return count + messages.filter(m => m.destinataireId === currentUser?.id && !m.lu).length;
  }, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Messagerie</h1>
        <Button onClick={() => setIsComposeOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau message
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex justify-between items-center">
              <span>Conversations</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredConversations.length === 0 ? (
              <div className="text-center py-6">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune conversation</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map(([userId, messages]) => {
                  const lastMessage = messages[messages.length - 1];
                  const unreadMessages = messages.filter(m => 
                    m.destinataireId === currentUser?.id && !m.lu
                  ).length;
                  
                  return (
                    <div
                      key={userId}
                      className={cn(
                        "p-3 rounded-md cursor-pointer transition-colors",
                        activeConversation === userId 
                          ? "bg-primary/10" 
                          : "hover:bg-muted",
                        unreadMessages > 0 && "border-l-4 border-l-primary"
                      )}
                      onClick={() => setActiveConversation(userId)}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {getUserName(userId)}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {getUserRole(userId)}
                          </span>
                        </div>
                        {unreadMessages > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                            {unreadMessages}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {lastMessage.expediteurId === currentUser?.id ? 'Vous: ' : ''}
                        {lastMessage.contenu}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatMessageDate(lastMessage.date)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>
              {activeConversation ? getUserName(activeConversation) : "Sélectionnez une conversation"}
              {activeConversation && (
                <span className="block text-sm font-normal text-muted-foreground mt-1">
                  {getUserRole(activeConversation)}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!activeConversation ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  Sélectionnez une conversation ou créez-en une nouvelle
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-[500px]">
                <div className="flex-grow overflow-y-auto space-y-4 mb-4 p-2">
                  {conversations[activeConversation].map(message => {
                    const isSentByMe = message.expediteurId === currentUser?.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end",
                          isSentByMe ? "justify-end" : "justify-start"
                        )}
                      >
                        {!isSentByMe && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="group relative">
                          <div className={cn(
                            "p-3 rounded-lg max-w-xs lg:max-w-md",
                            isSentByMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}>
                            <p className="text-sm">{message.contenu}</p>
                          </div>
                          <div className={cn(
                            "flex items-center text-xs text-muted-foreground mt-1",
                            isSentByMe ? "justify-end" : "justify-start"
                          )}>
                            <Clock className="h-3 w-3 mr-1" />
                            {formatMessageDate(message.date)}
                            {isSentByMe && (
                              <button
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteMessage(message.id)}
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </button>
                            )}
                          </div>
                        </div>
                        {isSentByMe && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ml-2 flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex">
                    <Textarea
                      placeholder="Ecrivez votre message..."
                      className="flex-grow resize-none"
                      rows={2}
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                    />
                    <Button 
                      className="ml-2 self-end" 
                      onClick={handleSendReply}
                      disabled={!newMessageText}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog pour composer un nouveau message */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Destinataire</Label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un destinataire" />
                </SelectTrigger>
                <SelectContent>
                  {potentialRecipients.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.prenom} {user.nom} ({getUserRole(user.id)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Ecrivez votre message..."
                rows={5}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Annuler</Button>
            <Button onClick={handleSendMessage}>Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
