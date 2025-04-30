
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { User, Message } from '@/types';
import { mockUsers, mockMessages } from '@/data/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

const Messages = () => {
  const { currentUser, role } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Message[]>([]);

  useEffect(() => {
    // Récupérer les messages et utilisateurs
    setMessages(mockMessages);

    let availableUsers: User[] = [];
    
    // Filtrer les utilisateurs selon le rôle
    if (role === 'patient') {
      // Patients can only message medical staff
      availableUsers = mockUsers.filter(user => user.role === 'medecin' || user.role === 'secretaire');
    } else if (role === 'medecin') {
      // Doctors can message patients, secretaries and other doctors
      availableUsers = mockUsers.filter(user => user.role === 'patient' || user.role === 'secretaire' || (user.role === 'medecin' && user.id !== currentUser?.id));
    } else {
      // Admins and secretaries can message everyone
      availableUsers = mockUsers.filter(user => user.id !== currentUser?.id);
    }
    
    setUsers(availableUsers);
    setFilteredUsers(availableUsers);
  }, [currentUser, role]);

  useEffect(() => {
    // Mettre à jour la liste filtrée des utilisateurs lors de la recherche
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        `${user.nom} ${user.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    // Mettre à jour la conversation sélectionnée
    if (selectedUser && currentUser) {
      const conversation = messages.filter(msg => 
        (msg.expediteurId === currentUser.id && msg.destinataireId === selectedUser.id) ||
        (msg.expediteurId === selectedUser.id && msg.destinataireId === currentUser.id)
      );
      
      // Trier les messages par date
      conversation.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setSelectedConversation(conversation);
      
      // Marquer les messages comme lus
      if (conversation.some(msg => msg.expediteurId === selectedUser.id && !msg.lu)) {
        const updatedMessages = messages.map(msg => {
          if (msg.expediteurId === selectedUser.id && msg.destinataireId === currentUser.id && !msg.lu) {
            return { ...msg, lu: true };
          }
          return msg;
        });
        setMessages(updatedMessages);
      }
    } else {
      setSelectedConversation([]);
    }
  }, [selectedUser, messages, currentUser]);

  const getUserById = (id: string): User | undefined => {
    return mockUsers.find(user => user.id === id);
  };

  const getInitiales = (user: User): string => {
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`;
  };

  const getLastMessage = (userId: string): { texte: string; date: string; nonLu: boolean } | null => {
    if (!currentUser) return null;
    
    const messagesWithUser = messages.filter(msg => 
      (msg.expediteurId === currentUser.id && msg.destinataireId === userId) ||
      (msg.expediteurId === userId && msg.destinataireId === currentUser.id)
    );
    
    if (messagesWithUser.length === 0) return null;
    
    // Trier les messages par date (du plus récent au plus ancien)
    messagesWithUser.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const lastMsg = messagesWithUser[0];
    const nonLu = lastMsg.expediteurId === userId && !lastMsg.lu && lastMsg.destinataireId === currentUser.id;
    
    return {
      texte: lastMsg.contenu.length > 30 ? `${lastMsg.contenu.substring(0, 30)}...` : lastMsg.contenu,
      date: format(new Date(lastMsg.date), 'dd/MM/yyyy HH:mm'),
      nonLu
    };
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUser || !selectedUser) {
      return;
    }
    
    const now = new Date();
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      expediteurId: currentUser.id,
      destinataireId: selectedUser.id,
      date: now.toISOString(),
      contenu: messageText.trim(),
      lu: false
    };
    
    setMessages([...messages, newMessage]);
    setMessageText('');
    
    toast.success("Message envoyé avec succès");
  };

  const getUserRole = (role: string): string => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'secretaire':
        return 'Secrétaire';
      case 'patient':
        return 'Patient';
      case 'medecin':
        return 'Médecin';
      default:
        return 'Utilisateur';
    }
  };

  const formatMessageDate = (dateString: string): string => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      // Si c'est aujourd'hui, afficher l'heure
      return `Aujourd'hui à ${format(messageDate, 'HH:mm')}`;
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      // Si c'est hier
      return `Hier à ${format(messageDate, 'HH:mm')}`;
    } else {
      // Sinon, afficher la date complète
      return format(messageDate, 'dd MMMM yyyy à HH:mm', { locale: fr });
    }
  };
  
  const hasUnreadMessages = (): boolean => {
    if (!currentUser) return false;
    
    return messages.some(msg => 
      msg.destinataireId === currentUser.id && !msg.lu
    );
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-gray-500">Communiquez avec les patients, médecins et le personnel</p>
        </div>
        
        <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] gap-4">
          {/* Liste des utilisateurs */}
          <Card className="w-full md:w-1/3 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Conversations</CardTitle>
              <div className="mt-2">
                <Input
                  placeholder="Rechercher un contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <ul className="divide-y">
                  {filteredUsers.length === 0 ? (
                    <li className="p-4 text-center text-gray-500">Aucun utilisateur trouvé</li>
                  ) : (
                    filteredUsers.map(user => {
                      const lastMessage = getLastMessage(user.id);
                      
                      return (
                        <li 
                          key={user.id}
                          onClick={() => setSelectedUser(user)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${
                            selectedUser?.id === user.id ? 'bg-gray-50' : ''
                          } ${
                            lastMessage?.nonLu ? 'bg-blue-50 hover:bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>{getInitiales(user)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <p className="font-medium truncate">
                                  {user.prenom} {user.nom}
                                </p>
                                {lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {lastMessage.date.split(' ')[0]}
                                  </span>
                                )}
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500 truncate">
                                  {getUserRole(user.role)}
                                </p>
                                {lastMessage?.nonLu && (
                                  <span className="inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                                )}
                              </div>
                              {lastMessage && (
                                <p className={`text-sm truncate mt-1 ${
                                  lastMessage.nonLu ? 'font-medium' : 'text-gray-500'
                                }`}>
                                  {lastMessage.texte}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Zone de conversation */}
          <Card className="w-full md:w-2/3 flex flex-col">
            {selectedUser ? (
              <>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitiales(selectedUser)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>
                        {selectedUser.prenom} {selectedUser.nom}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {getUserRole(selectedUser.role)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    {selectedConversation.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        Aucun message dans cette conversation
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedConversation.map(message => {
                          const isCurrentUser = currentUser?.id === message.expediteurId;
                          const expediteur = getUserById(message.expediteurId);
                          
                          return (
                            <div 
                              key={message.id} 
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className="flex gap-2 max-w-[70%]">
                                {!isCurrentUser && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {expediteur ? getInitiales(expediteur) : '??'}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div>
                                  <div 
                                    className={`p-3 rounded-lg ${
                                      isCurrentUser 
                                        ? 'bg-blue-500 text-white rounded-br-none' 
                                        : 'bg-gray-100 rounded-bl-none'
                                    }`}
                                  >
                                    {message.contenu}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatMessageDate(message.date)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Votre message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                        className="self-end"
                      >
                        Envoyer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
                <p className="mb-2 text-lg">Sélectionnez un contact pour commencer une conversation</p>
                <p>Vous pouvez rechercher un utilisateur dans la liste à gauche</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
