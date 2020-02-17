# Slices API

 
 The Slices API holds information regarding SliceMachine libraries. Its role is to serve different parts of the project (website, writing room, CLI) with slice definitions and bootstrapped files.
 
 Also, it's fairly new and subject to changes ✌️
Default, current URL: http://sm-api.now.sh/api
 
 ---

### list libraries

  Returns a json Array of all slice machine libraries

* **URL**

  /libraries

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   None

* **Data Params**
 
   `framework=[string]`

* **Success Response:**

  * **Code:** 200 
    **Content:** `[{ "packageName": "vue-essential-slices", "slices": [...]}, {...}]`
 
* **Error Response:**

  None

* **Sample Call:**

  ```javascript
    fetch(' http://sm-api.now.sh/api/libraries?framework=nuxt')
    .then(res => res.json())
  ```

### fetch library

  Returns a slice machine library (library name, Git url, slice definitions...), by library name

* **URL**

  /library

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   `lib=[string]||library=[string]`

* **Success Response:**

  * **Code:** 200 
    **Content:** `{ "packageName": "vue-essential-slices", "slices": [...] }`
 
* **Error Response:**

  None

* **Sample Call:**

  ```javascript
    fetch(' http://sm-api.now.sh/api/library?lib=vue-essential-slices')
    .then(res => res.json())
  ```

### fetch slice definitions

 Same as `/library` but only returns a non-empty array of slice definitions

 * **Success Response:**

  * **Code:** 200 
    **Content:** `[{ "slice_type": "my_slice", "type": "Slice", ... }]`

### Bootstrap a project

Generates a ZIP file used to "bootstrap" a working Prismic + framework (Nuxt or Next) + SliceMachine project. It sequentially downloads the library you selected, gets Prismic custom types and merges them to the library's slice definitions then builds all the files related to the framework you asked (pages, Prismic config) and instructions (dependencies to download, etc.),

* **URL**

  /bootsrtrap

* **Method:**

  `GET`
  
*  **URL Params**

   **Required:**
 
   None

   **Data Params**
 
   - `framework=[string]` (only 'nuxt' is supported RN)
   - `projectType=[string]` (Prismic project type, only 'landing' is supported RN)
   - `lib=[string]||library=[string]` (SM library to bootstrap, defaults to 'vue-essential-slices')

* **Success Response:**

  * **Code:** 200 
    **Content:** Zip file
 
* **Error Response:**

  None

* **Sample Call:**

  ```javascript
    const fs = require('fs')
    const tmp = require('tmp')
    const request = require('request')

    const tmpZipFile = tmp.tmpNameSync();

    request('http://sm-api.now.sh/api/bootstrap')
      .on('response', (response) => {
          response.pipe(fs.createWriteStream(tmpZipFile))
            .on('error', ({ message }) => console.error(message))
            .on('finish', () => console.log(`Check this -> ${tmpZipFile}`));
      })
      .on('error', console.error);
  ```

👆 Note that if you ended up reading this, you're early. Being early is awesome but it's not the most comfortable situation to be in. If you encounter difficulty, let me know in the issues ✌️