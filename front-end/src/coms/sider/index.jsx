import React from 'react';
import classNames from 'classnames';
import {Link} from 'dva/router';

import {toc as getToc} from '../../services';
import {toTreeToc} from './util';

import styles from './index.less';


class Sider extends React.Component{

  state = {
    toc: [],
    expanded: [],
    active: this.props.defaultSlug
  }

  async componentDidMount(){
    const toc = await getToc();
    this.setState({
      toc: toTreeToc(toc)
    });
  }


  componentWillReceiveProps(nextProps){
    if(nextProps.slug !== this.props.slug && nextProps.slug !== this.state.active){
      this.setState({
        active: nextProps.slug
      })
    }
  }

  onClick = (slug) => {
    return () => {
      // TODO: 展开或者收起侧边栏
      if(slug === '#'){
        return;
      }
      this.props.onChange(slug);
    }
  }

  renderSider = (toc) => {
    return (
      <div>
        {
          toc.map(t => {
            const showTrigger = t.children && t.children.length > 0;
            return (
              <div 
                key={t.slug + t.title + t.depth} 
                style={{ paddingLeft: 10 }}
              >
                <div 
                  className={classNames({
                    [styles.doc]: true,
                    [styles.active]: t.slug === this.state.active
                  })
                  }
                  onClick={this.onClick(t.slug)}
                > 
                  {
                    showTrigger
                    &&
                    <Link
                      to={`${t.slug}.html`}
                      className={styles.trigger} 
                      onClick={(e)=> {
                        e.preventDefault();
                      }}
                    >
                    </Link> 
                  }
                  <a 
                    href={`${t.slug}.html`} 
                    onClick={(e)=> {
                      e.preventDefault();
                    }} 
                    className={styles.title}
                  >
                    {t.title}
                  </a>
                </div>
                {
                  (t.children && t.children.length > 0) && (
                    this.renderSider(t.children)
                  )
                }
              </div>
            )
          })
        }
      </div>
    )
  }

  render(){

    const {toc} = this.state;

    return (
      <div className={styles.sider}>
        {this.renderSider(toc)}
      </div>
    )
  }
}

export default Sider;