public class Profile{

    g
    private String profileID;
    private String email;

    //Profile constructor
    public Profile(String profileID, String email){
        this.profileID = profileID;
        this.email = email;
    }

    //Profile getter functions
    public String getProfileID(){
        return profileID;
    }
    public String getEmail(){
        return email;
    }
    //Profile setter functions
    public void setProfileID(String profileID){
        this.profileID = profileID;
    }
    public void setEmail(String email){
        this.email = email;
    }

    //Profile methods
    public void updateProfile(){
        //logic here
    }

    public void viewProfile(){
        //logic here
    }


}
