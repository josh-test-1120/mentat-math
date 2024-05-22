package org.mentats.mentat;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HomeAPIController {
    /**
     * Test response API POJO
     */
    class TestResponse {
        private String data;
        public TestResponse(String data) {
            this.data = data;
        };
        // Quick data response
        public String getData() {
            return data;
        }
    }

    /**
     * Default mapping for API calls
     * Test feature for now with no POST data
     * @return JSON response
     */
    @GetMapping("/")
    public TestResponse index() {
        TestResponse result = new TestResponse("Hello from the Mentat Team!");
        return result;
    }

}

