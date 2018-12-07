import dva from 'dva';
import './index.css';

const getPrefix = () => {
  const pathname = window.location.pathname;
  const args = pathname.split('/');
  if(pathname.endsWith('.html')){
    args.pop();
    return args.join('/');
  } else {
    return args.join('/');
  }
}

window.PREFIX = getPrefix();
if(window.PREFIX === '/'){
  window.PREFIX = '';
}

if(window.PREFIX.endsWith('/')){
  window.PREFIX = window.PREFIX.replace(/\/$/, '');
}

// 1. Initialize
const app = dva();

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');