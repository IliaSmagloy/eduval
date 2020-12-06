import React from "react";
import history from '../history';
import {
  Card,
  CardHeader,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Form,
  FormInput,
  FormTextarea,
  Button,
  Container,
  CardBody
} from "shards-react";

import Modal from 'react-modal';
import RegisteredStudentsCard from "../components/lessonCards/RegisteredStudentsCard";
import PageTitle from "../components/common/PageTitle";
import TimeoutAlert from "../components/common/TimeoutAlert";
import CourseGraphCard from "../components/common/CourseGraphCard";
import server from "../Server/Server";
import TagsInput from 'react-tagsinput';
import { withTranslation } from "react-i18next";
import { capitalize } from '../utils/strings';

Modal.setAppElement('#root');

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-40%, -40%)',
    maxHeight            : '85vh'
  }
};

class CourseDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      reg_students: [],

      new_students: [],

      tag : '',

      course: {id: "", name: "", location: "", description: "", startDate: "", endDate: ""},

      original_course_name: "",

      // Third list of posts.
      PostsListThree: [
        {
          id:"1",
          FirstName: "Stud1",
          LastName:"Sixth grade",
          Phone:"123456789",
        }
      ],

      modalDeleteIsOpen: false,

      student: {},
      showDeleteCourseModal: false,
      just_deleted: false,
    };

    this.updateName = this.updateName.bind(this);
    this.updateDescription = this.updateDescription.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
    this.update = this.update.bind(this);

    this.handleStudentsChange = this.handleStudentsChange.bind(this);
    this.handleChangeTagInput = this.handleChangeTagInput.bind(this);
    this.updateStudents = this.updateStudents.bind(this);

    this.closeDeleteModal = this.closeDeleteModal.bind(this);
    this.showDeleteItemModal = this.showDeleteItemModal.bind(this);
    this.deleteCourseModal = this.deleteCourseModal.bind(this);
    this.closeDeleteCourseModal = this.closeDeleteCourseModal.bind(this);
  }

  handleChangeTagInput(tag){
    this.setState({tag: tag});
  }

  updateStudents(){
    let self = this;
    let students = this.state.new_students;
    //TODO add last
    if (this.state.tag && this.state.tag.trim() != ''){
      students += [this.state.tag];
    }
    if (students.length === 0)
      return;
    this.setState({disabled: true});
    server.addStudentsToCourse(function(response){
      window.location.reload();
    }, function(error){
      console.log("Error in updateStudents in CourseDetails.js", error);
      self.setState({error: "An error has occurred", success: false, disabled: false});
      window.scrollTo(0, 0);
    }, students, this.props.match.params.id);
  }

  update(){
    let self = this;
    this.setState({disabled: true});
    let checkFilled = (input) => (input === null || input === "" || !input);

    if (checkFilled(this.state.course.name) || checkFilled(this.state.course.description) ||
      checkFilled(this.state.course.location) || checkFilled(this.state.course.startDate) ||
      checkFilled(this.state.course.endDate)){
      this.setState({error: "Please fill all forms!", success: false, disabled: false});
      window.scrollTo(0, 0);
      return;
    }

    let course = this.state.course;

    delete course.status;

    server.updateCourse(function(response){
      self.setState({error: false, success: true, disabled: false});
      server.getCourse(function(response){
        self.setState({course: response.data});
        self.setState({original_course_name: response.data.name});
      }, function(error){
        console.log("Error in getCourse in updateCourse in CourseDetails.js");
      }, self.props.match.params.id);
      window.scrollTo(0, 0);
    }, function(error){
      console.log("failed", error);
      self.setState({error: "An error has occurred", success: false, disabled: false});
      window.scrollTo(0, 0);
    }, self.state.course);
  }

  handleStudentsChange(new_students) {
    this.setState({new_students: new_students})
  }


    updateName(evnt){
      let course = this.state.course;
      course.name = evnt.target.value;
      this.setState({course: course});
    }

    updateDescription(evnt){
      let course = this.state.course;
      course.description = evnt.target.value;
      this.setState({course: course});
    }

    updateLocation(evnt){
      let course = this.state.course;
      course.location = evnt.target.value;
      this.setState({course: course});
    }

    updateStartDate(evnt){
      let course = this.state.course;
      course.startDate = evnt.target.value;
      this.setState({course: course});
    }

    updateEndDate(evnt){
      let course = this.state.course;
      course.endDate = evnt.target.value;
      this.setState({course: course});
    }


  componentDidMount() {
    var self = this;
    server.getCourse(function(response){
      self.setState({course: response.data});
      self.setState({original_course_name: response.data.name});
    }, function(error){
      console.log("Error in getCourse in componentDidMount in CourseDetails.js");
    }, this.props.match.params.id);

    server.getRegisteredStudents(function(response){
      self.setState({reg_students: response.data});
    }, function(error){ console.log("Error in componentDidMount in CourseDetails.js", error)
    }, this.props.match.params.id);

    server.getActiveLesson(function(response){
      if (response.data)
        self.setState({activeLesson: response.data});
    }, (err)=>{console.log("err", err);});
  }

  showDeleteItemModal(student) {
    this.setState({modalDeleteIsOpen: true,
      student: student});
  }

  closeDeleteModal() {
    this.setState({modalDeleteIsOpen: false});
  }
  closeDeleteCourseModal() {
    this.setState({showDeleteCourseModal: false});
  }

  deleteCourseModal(){
    this.setState({showDeleteCourseModal: true});
  }

  render(){
    let self = this;
    let showDeleteItemModal = this.showDeleteItemModal;
    let closeDeleteModal = this.closeDeleteModal;
    let closeDeleteCourseModal = this.closeDeleteCourseModal;
    const{
      reg_students
    } = this.state;

    const { t } = this.props;

    return(
      <div>

      <Modal
        isOpen={this.state.showDeleteCourseModal}
        onRequestClose={this.closeDeleteCourseModal}
        style={customStyles}
      >
      <p>{t("deleteConfirm", {name: this.state.course.name})}</p>

      <Button disabled={this.state.disabled} theme="success" onClick={()=>{
        self.setState({disabled: true});
        server.deleteCourse((response)=>{history.push("/my-courses");},
        (err)=>{self.setState({disabled: false, error: t("An error has occurred")}); window.scrollTo(0, 0);},
        self.props.match.params.id);
      }}>{t("Yes")}</Button>
      <Button theme="danger" disabled={this.state.disabled} style={{float: "right"}} onClick={closeDeleteCourseModal}>{t("No")}</Button>
      </Modal>


      {this.state.error &&
      <TimeoutAlert className="mb-0" theme="danger" msg={this.state.error} time={10000}/>
      }
      {this.state.success &&
      <TimeoutAlert className="mb-0" theme="success" msg={"Success! Your course has been updated!"} time={10000}/>
      }
      <Container fluid className="main-content-container px-4 pb-4">

      {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle sm="4" title={this.state.original_course_name} subtitle={t("Course Details")} className="text-sm-left" />
          </Row>

          <Row>
            <Col lg="6">
              {/* Editor */}
              <Card style = {{height:"auto",width:"100%",marginLeft:"16px"}} className="mb-4">
                <ListGroup flush>
                <ListGroupItem className="p-3">
                  <Row>
                    <Col>
                      <Form>
                        <Row form>
                        {/* Course Name */}
                          <Col md="6" className="form-group">
                            <label htmlFor="feFirstName">{t("Course Name")}</label>
                            <FormInput
                            id="feFirstName"
                            placeholder="Course Name"
                            value={this.state.course.name}
                            onChange={this.updateName}
                            />
                          </Col>
                          {/* Course Location */}
                          <Col md="6" className="form-group">
                            <label htmlFor="feZipCode">{t("Class Room")}</label>
                            <FormInput
                            id="feZipCode"
                            value={this.state.course.location}
                            onChange={this.updateLocation}
                            />
                          </Col>
                        </Row>
                        <Row form>
                          {/* Start */}
                          <Col md="6" className="form-group">
                            <label htmlFor="feLastName">{t("Start Date")}</label>
                            <FormInput
                            type="date"
                            id="feLastName"
                            value={this.state.course.startDate}
                            onChange={this.updateStartDate}
                            />
                          </Col>

                          {/* End */}
                          <Col md="6" className="form-group">
                            <label htmlFor="feEmail">{t("End Date")}</label>
                            <FormInput
                            type="date"
                            id="feEmail"
                            value={this.state.course.endDate}
                            onChange={this.updateEndDate}
                            />
                          </Col>
                        </Row>
                        <Row form>
                        {/* Description */}
                          <Col md="12" className="form-group">
                            <label htmlFor="feDescription">{t("Lesson Name")}</label>
                            <FormTextarea id="feDescription" rows="3" value={this.state.course.description} onChange={this.updateDescription}/>
                          </Col>
                        </Row>
                        <Button outline disabled={this.state.disabled} onClick={this.update} theme="accent">{t("Update Lesson")}</Button>
                        <Button theme="success" disabled={this.state.disabled || (this.state.activeLesson && this.state.activeLesson != this.props.match.params.id)} onClick={()=>{
                          this.setState({disabled: true});
                          if(this.state.activeLesson == this.props.match.params.id){
                            history.push("/lesson/" + this.props.match.params.id);
                            return;
                          }
                          let self = this;
                          server.changeLessonStatus(function(response){
                            history.push("/lesson/" + self.props.match.params.id);
                          }, function(error){
                            self.setState({disabled: false, error: t("An error has occurred")}); window.scrollTo(0, 0);
                          }, this.props.match.params.id, "LESSON_START");
                        }} style={{float:"right"}}>{(this.state.activeLesson != this.props.match.params.id && t("Start Lesson")) || (this.state.activeLesson == this.props.match.params.id && t("Resume Lesson"))}</Button>
                      </Form>
                    </Col>
                  </Row>
                </ListGroupItem>
                </ListGroup>
                <CardBody>
                  <Row>
                    <Col>
                      <label style={{marginLeft: "20px", fontSize: "16px"}}>{t("Add students to course")}</label>
                    </Col>
                    <Col>
                      <Button theme="primary" disabled={this.state.disabled} style={{marginRight: "20px", float: "right"}} onClick={this.updateStudents}>{t("Add")}</Button>
                    </Col>
                  </Row>
                  <TagsInput onlyUnique
                  inputProps={{placeholder: t("Add students by Email")}}
                  addKeys={[9, 13, 32, 186, 188]}
                  value={this.state.new_students}
                  inputValue={this.state.tag}
                  onChangeInput={this.handleChangeTagInput}
                  onChange={this.handleStudentsChange} />
                </CardBody>
              </Card>
            </Col>
            <Col lg="6">
              {this.state.course.id!="" &&
                <CourseGraphCard
                courseId={this.state.course.id}
                justDeleted={this.state.just_deleted}
                revertJustDeleted={()=>this.setState({just_deleted:false})}

                />
              }

              {this.state.course.id=="" &&
                <div>
                  Loading..
                </div>
              }
            </Col>
          </Row>
          <Row>
            <RegisteredStudentsCard
              registered_students={this.state.reg_students}
              students={this.state.reg_students}
              courseDetails={true}
              deleteStudent={
                (id)=>{
                  var teacher_profile = server.getTeacherProfile(
                    function(error){
                      console.log("error in getTeacherProfile in deleteStudent Button in CourseDetails.js",error)
                    }
                  )
                  self.setState({disabled: true});
                  server.deleteStudent(function(response){
                    self.setState({just_deleted:true});
                  },
                  function(error){
                    self.setState({
                      disabled: false,
                    });
                    console.log("error in deleteStudent in deleteStudent in Button in CourseDetails.js", error)
                    window.scrollTo(0, 0);
                  },
                  self.state.course.id,
                  id);

                }
              }
            />
          </Row>
          <Row>

          </Row>
        </Container>
        </div>
      );
    }
  }



export default withTranslation()(CourseDetails);
