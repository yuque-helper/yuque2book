import React from 'react';
import {book as getBook} from '../../services/index';

import styles from './index.less';

class Header extends React.Component{
  state = {
    book: {}
  }

  async componentDidMount(){
    const book = await getBook();
    this.setState({
      book
    });
    window.document.getElementsByTagName('title')[0].innerText = book.name;
  }

  render(){

    const {book} = this.state;

    return (
      <div className={styles.header}>
        <div className={styles.title}>{book.name}</div>
      </div>
    )
  }
}

export default Header;