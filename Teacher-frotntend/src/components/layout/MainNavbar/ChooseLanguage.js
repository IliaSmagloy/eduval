import React from "react";
import { Link } from "react-router-dom";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Collapse,
  NavItem,
  NavLink
} from "shards-react";

import Flag from "react-flags";
import { withTranslation } from 'react-i18next';

class ChooseLanguage extends React.Component {

  _isMounted = false;

  langToFlag = {
    'en': 'US',
    'ru': 'RU',
    'he': 'IL',
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      flag: this.langToFlag[this.props.i18n.language] || 'US'
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.changeLang = this.changeLang.bind(this);
    this.updateFlag = this.updateFlag.bind(this);
    this.props.i18n.on('languageChanged', this.updateFlag);
  }

  updateFlag() {
    this.setState({
      flag: this.langToFlag[this.props.i18n.language],
    });
  }

  changeLang(lang) {
    this.props.i18n.changeLanguage(lang);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  toggleDropdown() {
    this.setState({
      visible: !this.state.visible
    });
  }
//onClick={this.logout.bind(this)}
  render() {
    const { t } = this.props;

    return (
      <div >
        <NavItem tag={Dropdown} caret toggle={this.toggleDropdown}>

          <DropdownToggle caret tag={NavLink} className="text-nowrap px-3">
            <Flag name={this.state.flag} format="png" pngSize={32} shiny={true} alt="Choose Language" basePath="/img/flags"/> {t('Language')}
          </DropdownToggle>

          <Collapse tag={DropdownMenu} right small open={this.state.visible}>
            <DropdownItem tag={Link} to="#" onClick={() => this.changeLang('en')}>
              <Flag name="US" format="png" pngSize={32} shiny={true} alt="English" basePath="/img/flags"/> English
            </DropdownItem>

            <DropdownItem divider />

            <DropdownItem tag={Link} to="#" onClick={() => this.changeLang('ru')}> 
              <Flag name="RUS" format="png" pngSize={32} shiny={true} alt="Russian" basePath="/img/flags"/> Russian
            </DropdownItem>

            <DropdownItem divider />

            <DropdownItem tag={Link} to="#" onClick={() => this.changeLang('he')}> 
              <Flag name="IL" format="png" pngSize={32} shiny={true} alt="Hebrew" basePath="/img/flags"/> Hebrew
            </DropdownItem>

          </Collapse>
        </NavItem>
      </div>
    );
  }
}

export default withTranslation()(ChooseLanguage);
