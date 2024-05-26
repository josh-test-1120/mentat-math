package org.mentats.mentat;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    @GetMapping("/")
    public String index() {
        // default page generated from NextJS Framework
        return "index.html";
    }
    @GetMapping("/dashboard")
    public String dashboard() {
        //student dashboard for ezmath
        return "Student-Dashboard.html";
    }

    @GetMapping("/grades")
    public String grades() {
        //'see test scores and requirements' page
        return "Student-Grades-Tests.html";
    }

    @GetMapping("/schedule")
    public String schedule() {
        //'schedule quiz' page
        return "Students-Scheduling.html";
    }

    @GetMapping("/profile")
    public String profile() {
        return "Profile.html";
    }

    @GetMapping("/settings")
    public String settings() {
        return "Settings.html";
    }

    @GetMapping("/teacherdashboard")
    public String teacherdashboard() {
        //student dashboard for ezmath
        return "Instructor_Dashboard.html";
    }

    @GetMapping("/teacherscheduling")
    public String teacherscheduling() {
        //student dashboard for ezmath
        return "Instructor-Scheduling.html";
    }

}