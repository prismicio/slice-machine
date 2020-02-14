const Scaffolder = require(`../bootstrap/nuxt`);
const scaffolder = Scaffolder();
scaffolder.createFiles(null, ({ name, f }) => console.log(name, f));


