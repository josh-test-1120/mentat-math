package org.mentats.mentat.payload.response;

/**
 * This is the Message serializer
 * Assists in handling response messages of different structs
 * @author Joshua Summers
 */
public class MessageResponse {
    private String message;

    /**
     * Default constructor
     * @param message string of the response
     */
    public MessageResponse(String message) {
        this.message = message;
    }

    /**
     * Getter for the message
     * @return string of the message
     */
    public String getMessage() {
        return message;
    }

    /**
     * Setter for the message
     * @param message string of the message
     */
    public void setMessage(String message) {
        this.message = message;
    }
}