package com.nulpointerexception.npechatroom;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import static java.lang.String.format;

@Controller
@CrossOrigin
public class ChatRoomController {

    private static final Logger logger = LoggerFactory.getLogger(ChatRoomController.class);
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;
    //   private User user = null;



    @MessageMapping("/chat/{roomId}/sendMessage")
    @SendTo("/topic/public")
    public void sendMessage(@DestinationVariable String roomId, @Payload Message chatMessage) {
        logger.info(roomId+" Chat messahe recieved is "+chatMessage.getContent());
        messagingTemplate.convertAndSend(format("/chat-room/%s", roomId), chatMessage);
    }

    @MessageMapping("/chat/{roomId}/addUser")
    @SendTo("/topic/public")
    public void addUser(@DestinationVariable String roomId, @Payload Message chatMessage,
                        SimpMessageHeaderAccessor headerAccessor) throws Exception {
        headerAccessor.getSessionAttributes().put("username",chatMessage.getSender());


        messagingTemplate.convertAndSend(format("/chat-room/%s", roomId), chatMessage);

    }

    @MessageMapping("/chat/{roomId}/leaveUser")
    @SendTo("/topic/public")
    public void leaveUser(@DestinationVariable String roomId, @Payload Message chatMessage,
                          SimpMessageHeaderAccessor headerAccessor) throws Exception {
        logger.info("user leave"+chatMessage.getSender());
        messagingTemplate.convertAndSend(format("/chat-room/%s", roomId), chatMessage);

    }



//    @MessageMapping("chat/user/{username}")
//    @SendTo("/topic/public")
//    public void showUsers(@DestinationVariable String username){
//       logger.info("Getting " + username);
//        List<User> users = new ArrayList<>();
//        if (username!=null) {
//            User user = new User();
//            user.setName(username);
//            users.add(user);
//
//        }
//        //return users;
//        users.forEach(user1 -> logger.info(user1.getName()));
//
//        messagingTemplate.convertAndSend("/chat-room/users", users);
//    }

}
