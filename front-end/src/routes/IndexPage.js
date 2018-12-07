import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';

import Body from '../coms/body';
import Sider from '../coms/sider';
import Header from '../coms/header';
import {doc, getFirstSlug} from '../services/index';
import styles from './IndexPage.less';

class Index extends React.Component{
  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func
    }),
    location: PropTypes.object
  }

  state = {
    docBody: null
  }

  // 获取当前的slug
  getSlug = (location = this.props.location) => {
    let slug = location.pathname.replace(/\.html$/, '');
    if(slug.startsWith('/')){
      slug = slug.replace(/^\//, '');
    }

    return slug;
  }

  async componentDidMount(){
    const {location} = this.props;
    const slug = this.getSlug(location);
    if(slug){
      this.getDocByLocation(location); 
    } else {
      // 获取最近的一个slug
      const firstSlug = await getFirstSlug();
      if(firstSlug){
        this.onChange(firstSlug);
      }
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.location.pathname !== this.props.location.pathname){
      this.getDocByLocation(nextProps.location);
    }
  }

  getDocByLocation = (location) => {
    const slug = this.getSlug(location);
    if(!this.state.docBody){
      this.onChange(slug);
    }
  }

  onChange = async (slug) => {
    const {history, location} = this.props;
    location.pathname = `/${slug}.html`;
    history.push(location);

    const docBody = await doc(slug);

    this.setState({
      docBody: docBody
    });
  }

  render(){

    const {docBody} = this.state;

    return (
      <div className={styles.normal}>
        <Header />
        <div className={styles.body}>
          <Sider 
            onChange={this.onChange}
            defaultSlug={this.getSlug()}
            slug={this.getSlug()}
          />
          <Body doc={docBody} />
        </div>
      </div>
    );
  }
}

export default connect()(Index);
