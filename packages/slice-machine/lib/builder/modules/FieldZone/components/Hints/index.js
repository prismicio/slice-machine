import toReact from './toReact';
import toVue from './toVue';


const hint = (framework, item, modelFieldName, key) => { 
  const isVue = framework === 'nuxt' || framework === 'vue' ;
  // const isReact = framework === 'react' || framework === 'next';
  return isVue ? toVue(item, modelFieldName, key) : toReact(item, modelFieldName, key);
}

export default hint;