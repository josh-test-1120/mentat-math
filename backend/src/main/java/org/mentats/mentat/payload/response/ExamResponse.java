package org.mentats.mentat.payload.response;
import org.mentats.mentat.models.Exam;

/**
 * Form response validation serializer
 * Exam response objects
 * serialize Exam responses
 * @author Joshua Summers
 */
public class ExamResponse {
    private Long examId;
    private Long examCourseId;    // Only ID, not full entity
    private String examName;
    private Integer examRequired;
    private Integer examState;
    private Integer examDifficulty;
    private Double examDuration;
    private Integer examOnline;

    // Constructor from Entity
    public ExamResponse(Exam exam) {
        this.examId = exam.getId();
        this.examCourseId = exam.getCourse() != null ? exam.getCourse().getCourseId() : null;
        this.examName = exam.getName();
        this.examRequired = exam.getRequired();
        this.examState = exam.getState();
        this.examDifficulty = exam.getDifficulty();
        this.examDuration = exam.getDuration();
        this.examOnline = exam.getOnline();
    }

    // Getters only (response is read-only)
    public Long getExamId() { return examId; }
    public Long getExamCourseId() { return examCourseId; }
    public String getExamName() { return examName; }
    public Integer getExamRequired() { return examRequired; }
    public Integer getExamState() { return examState; }
    public Integer getExamDifficulty() { return examDifficulty; }
    public Integer getExamOnline() { return examOnline; }
    public Double getExamDuration() { return examDuration; }

    /**
     * String override for output response
     * @return
     */
    @Override
    public String toString() {
        return "ExamResponse{" +
                "examId=" + examId +
                ", examCourseId=" + examCourseId +
                ", examName='" + examName + '\'' +
                ", examRequired=" + examRequired +
                ", examState=" + examState +
                ", examDifficulty=" + examDifficulty +
                ", examDuration=" + examDuration +
                ", examOnline=" + examOnline +
                '}';
    }
}
