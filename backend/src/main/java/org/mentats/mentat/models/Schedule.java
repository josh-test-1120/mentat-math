package org.mentats.mentat.models; /** This class represents a Schedule entity that will be used to schedule exams with input fields such
 * as scheduleDate, etc.
 * @author Phillip Ho
 */

import java.util.Date;


public class Schedule {


        private int scheduleID;
        private int studentID;
        private int examID;
        private Date scheduleDate;

        //Schedule constructor
        public Schedule(int scheduleID, int studentID, int examID, Date scheduleDate) {
            this.scheduleID = scheduleID;
            this.studentID = studentID;
            this.examID = examID;
            this.scheduleDate = scheduleDate;
        }

    public Schedule() {

    }


    //Schedule getter functions
        public int getScheduleID() {
            return scheduleID;
        }
        public int getStudentID() {
            return studentID;
        }
        public int getExamID() {
            return examID;
        }
        public Date getScheduleDate() {
            return scheduleDate;
        }

        //Schedule setter functions
        public void setScheduleID(int scheduleID) {
            this.scheduleID = scheduleID;
        }
        public void setStudentID(int studentID) {
            this.studentID = studentID;
        }
        public void setExamID(int examID) {
            this.examID = examID;
        }
        public void setScheduleDate(Date scheduleDate) {
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