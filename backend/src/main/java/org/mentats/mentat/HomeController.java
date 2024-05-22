package org.mentats.mentat;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    /**
     * Default mapping for MVC calls
     * Test feature for now with no POST data
     * @return XML response
     */
    @GetMapping("/")
    public String index() {
        // default page generated from NextJS Framework
        return "index.html";
    }

}