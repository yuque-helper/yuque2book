import React from 'react';
import PropTypes from 'prop-types';

import styles from './index.less';

class Body extends React.Component{
  static propTypes = {
    doc: PropTypes.shape({
      title: PropTypes.string,
      body_html: PropTypes.string,
      slug: PropTypes.oneOfType([
        PropTypes.number, PropTypes.string
      ])
    })
  }

  render(){
    const {doc} = this.props;
    if(!doc){
      return null;
    }

    return (
      <div className={styles.container}>
        <div className={styles['doc-container'] + ' typo'}>
          <h1>{doc.title}</h1>
          <div dangerouslySetInnerHTML={{__html: doc.body_html}}></div>
        </div>
      </div>
    )
  }
}

export default Body;