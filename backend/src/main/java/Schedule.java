/**
 * @author Phillip Ho
 */
public class Schedule {

        private String scheduleID;
        private String studentID;
        private String examID;
        private String scheduleDate;

        //Schedule constructor
        public Schedule(String scheduleID, String studentID, String examID, String scheduleDate) {
            this.scheduleID = scheduleID;
            this.studentID = studentID;
            this.examID = examID;
            this.scheduleDate = scheduleDate;
        }

        //Schedule getter functions
        public String getScheduleID() {
            return scheduleID;
        }
        public String getStudentID() {
            return studentID;
        }
        public String getExamID() {
            return examID;
        }
        public String getScheduleDate() {
            return scheduleDate;
        }

        //Schedule setter functions
        public void setScheduleID(String scheduleID) {
            this.scheduleID = scheduleID;
        }
        public void setStudentID(String studentID) {
            this.studentID = studentID;
        }
        public void setExamID(String examID) {
            this.examID = examID;
        }
        public void setScheduleDate(String scheduleDate) {
            this.scheduleDate = scheduleDate;
        }

        //Schedule methods
        public void createSchedule(){
            //logic here
        }
        public void updateSchedule(){
            //logic here
        }
        public void deleteSchedule(){
            //logic here
        }

}