import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Col } from "shards-react";

const LessonPageTitle = ({ title, subtitle, className, ...attrs }) => {
  const classes = classNames(
    className,
    "text-center",
    "text-md-left",
    "mb-sm-0"
  );

  return (
    <Col xs="12" sm="4" className={classes} { ...attrs }>
      <span style={{fontSize: "16px", color: "#3D5170"}} className="text-uppercase page-title">{subtitle}</span>
      <h3 style={{fontSize: "18px"}} className="page-title" >{title}</h3>
    </Col>
  )
};

LessonPageTitle.propTypes = {
  /**
   * The page title.
   */
  title: PropTypes.string,
  /**
   * The page subtitle.
   */
  subtitle: PropTypes.string
};

export default LessonPageTitle;
