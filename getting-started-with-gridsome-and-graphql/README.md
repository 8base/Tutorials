# Getting Started with Gridsome
Gridsome makes it super easy for developers to build modern websites, apps, and PWAs. Using Vue.js, GraphQL, Node, and pretty much anything that's JavaScript, Gridsome allows for quick development and deployment of awesome JAMstack applications, not to mention SEO friendly and extremely fast ones.

In this "Getting Started" tutorial, we're going to go over many topics. They are:

* Understanding Static Site Generators
* Introduction to Gridsome
* The way Gridsome Works
* Starting a new Gridsome Site
  * Prerequisite
  * Installation
  * Project Structure
  * Plugins
  * GraphQL data
  * Layout Components
  * Pages Components
  * Deploying Sites
* Wrapping Up

Woo hoo! There's a lot to get to, so let's get going. 


## Understanding Static Site Generators
Once upon a time, the web was made up mostly of simple HTML sites. Maybe some CSS got sprinkled in to give a page some pizazz. That said, this [Welcome to Netscape](http://home.mcom.com/home/welcome.html) website that is *still live from 1994* is an excellent reminder of what was once premium web content.

These simple sites were and still are, consider **static sites**. Simple HTML files that got returned to the browser by a server. None of the content was dynamic, as we now expect to see in even the most basic of today's web-apps and websites. 

However, while **static sites** predate dinosaurs – in technological dog-years, of course – [Static Site Generators](https://indieweb.org/static_site_generator) are somewhat new and trendy. Essentially, Static Site Generators accomplish two things. 

1. Give a developer compelling tools for building sites locally on their computer (hot-reloading, an app framework, etc.) 
2. **Pre-builds** the site as a set of static files before being deployed to the server

By pre-building, the pages as static files, the deployed site are incredibly fast. Fast because no server-side rendering or massive javascript operations are needed to render the site's pages. With the recent trend and popularity in [JAMstack](https://jamstack.org/) applications (JavaScript, APIs, Markup), Static Site Generators are fulfilling the "J" requirement by creating highly performant and lean clients sites. 

## Introduction to Gridsome
If you're familiar with the relationship between [ReactJS](https://reactjs.org/) and [Gatsby](https://gatsbyjs.org), great. If not, don't worry about it! Pretty much, like Gatsby is built on ReactJS, [Gridsome](https://gridsome.org) is built on [VueJS](https://vuejs.org/). 

As you may have guessed at this point, Gridsome is a Static Site Generator and is used to build awesomely performant websites. A killer feature of Gridsome is that it provides a GraphQL layer that allows for data to get queried from one or more APIs. The site's static pages can get dynamically generated at build time using different data sources.

The following bullets exist on [Gridsome.org](https://gridsome.org) on both the home page and docs section. That said, here's a best hits list of some of the great capabilities that Gridsome comes with out of the box.

* Data-sources (as plugins) - Query data from CMSs, Markdown-files or APIs.
* Vue.js Frontend - Vue is just the best, Gridsome lets you use it as a front-end framework.
* Hot-reloading development - Preconfigured real-time loading in developing.
* GraphQL layer - Management for all data sources in one place.
* Fast static pages - Fast and secure site deploys.

## The way Gridsome Works
First off, let's think about data. Whether the data is stored in local files, a CMS, some external API, or a database, Gridsome allows you to bring it in as a data source. What then happens with [GraphQL](https://graphql.org/) is that all those different data-sources get integrated into a single queryable interface. You can think about it as a central management system that pulls in all your data and makes it available to the Vue components.

During development, all these data-sources get queried in real-time. Meaning that when the page gets reloaded, or a change gets made, any data is fetched from its source. However, when a site is being built for production, the data gets queried, and a static page is generated. The generated pages are what then get deployed to a server or CDN. 

## Starting a new Gridsome Site
Enough chit-chat! Let's get our hands dirty.

### Prerequisite
To follow along, make sure that you have the following under wraps:

1. Node v8.0 or higher installed on your computer
2. Familiarity `NPM` or `Yarn` package managers.
3. Some familiarity with JavaScript and Vue (it will help!)

### Installation
Lets first check that Node and npm are installed.

```bash
$ node --version && npm -v
=>
v12.6.0
6.9.0
```

If the output throws an error, please follow the steps to [install Node here](https://nodejs.org/en/download/). Assuming though that you're a total rock-star and came to the show prepared, let's move straight into installing the Gridsome CLI.

```bash
# Install Gridsome CLI
$ npm install --global @gridsome/cli
```

Once installed, we're going to create a new project using the CLI and run it on a local server. The framework gives us a preconfigured project to do just that, so it's super simple. 

```bash
# Create the project
$ gridsome create my-site
# Move into project dir
$ cd my-site
# Run development server
$ gridsome develop
```

The Gridsome site should now be up and running on port 8080. Additionally, take note of the two different URLs displayed in the console. The first one(s) is where you can view your site, like [http://localhost:8080/](http://localhost:8080/). However, the other one that reads [http://localhost:8080/___explore](http://localhost:8080/___explore) is to a GraphQL playground where you can test out queries and view responses! Pretty cool, right?

### Project Structure
Before we start building something, we'll want to take a look at the structure of our Gridsome project. Each folder/file in the project is going to be used for a specific task or responsibility. Understanding those will only help us build something that's great.

```bash
# Project struction using `tree .` command
my-site
├── README.md
├── gridsome.config.js
├── gridsome.server.js
├── package.json
├── src
│   ├── components
│   │   └── README.md
│   ├── favicon.png
│   ├── layouts
│   │   ├── Default.vue
│   │   └── README.md
│   ├── main.js
│   ├── pages
│   │   ├── About.vue
│   │   ├── Index.vue
│   │   └── README.md
│   └── templates
│       └── README.md
├── static
│   └── README.md
└── yarn.lock
```
**Important Files**
* `gridsome.config.js` - The configuration file for Gridsome plugins.
* `gridsome.server.js` - An optional file that can get used for creating hooks with the Gridsome server.
* `static/` - Directory for any files to get copied to dist/ folder during the build.
* `src/main.js` - Contains app configuration for plugins and other features for the Gridsome API.
* `src/layouts/` - Layout components wrap pages and templates. These are global components.
* `src/pages/` - Every Page component becomes a site page, with its path determined by the `.vue` files location. 
* `src/templates/` - Templates are for GraphQL collections.

Before we kick-off, let's make sure that our project will look pretty by adding `Buefy` (Bulma for Vue). We will need to install it as a dependency and add it to the `src/main.js` file.

```bash
# Install buefy
$ npm install --save buefy
```

Import `Buefy` and its `css` code in `main.js` and register `Buefy` with the `Vue.use()` method. 

```javascript
// src/main.js

// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api
import DefaultLayout from '~/layouts/Default.vue'

// import Buefy module and css
import Buefy from 'buefy'
import 'buefy/dist/buefy.css' 

export default function (Vue, { router, head, isClient }) {
  // Use Buefy for app styling
  Vue.use(Buefy)
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)
}
```

### Plugins
Gridsome apps benefit from plugins in that they add great features and functionalities. To demonstrate this, we're going to be adding an awesome Gridsome plugin called `@gridsome/source-graphql`. It's going to allow us to pull in any GraphQL schema locally. Let’s do it!

```bash
# Install the plugin as a dependency
npm install --save @gridsome/source-graphql
```

Let's update our `gridsome.config.js` file to match the following. [Most Gridsome plugins](https://gridsome.org/plugins/) are well documented and explain the exact config needed to make them work. In this case, we're providing a GraphQL API endpoint, some type names for sectioning our API, and an API token.

```javascript
// gridsome.config.js
module.exports = {
  siteName: 'Gridsome',
  plugins: [
    {
      use: '@gridsome/source-graphql',
      options: {
        url: process.env['EIGHTBASE_WORKSPACE_ENDPOINT'],
        fieldName: 'eightBase',
        typeName: 'eightBase',

        headers: {
          Authorization: `Bearer ${process.env['EIGHTBASE_API_TOKEN']}`,
        },
      },
    },
  ],
}
```

There are many GraphQL APIs out there. However, [8base](https://8base.com) is going to work perfectly in that it will allow us to launch a queryable endpoint quickly. To get it to work, take the following steps.

1. Create an 8base account if you don't have one: [quickstart (Step 1)](https://docs.8base.com/getting-started/quick-start)
2. Create an API Token in 8base with the Administrator role attached: [docs here](https://docs.8base.com/8base-console/roles-and-permissions#api-tokens)
3. Collect your workspace endpoint from the home dashboard: [docs here](https://docs.8base.com/8base-console/graphql-api#graphql-api-and-basic-concepts)

If you want to create some custom tables to query, knock yourself out. For the sake of this guide, we'll use the 8base *Users* table that comes preconfigured with each workspace.

As seen in the `gridsome.config.js` file, we're passing environment variables to the plugins configuration. We need to set those variables! Add a `.env` file in the root directory of your Gridsome project with the following environment variables set to your workspaces values. The development server always looks for that file and reads/sets its contents when starting up.

```text
EIGHTBASE_API_TOKEN=<YOUR_API_TOKEN>
EIGHTBASE_WORKSPACE_ENDPOINT=<YOUR_WORKSPACE_ENDPOINT>
```

With that plugin now set up, we can go check out the GraphQL playground at [http://localhost:8080/___explore](http://localhost:8080/___explore) and see which 8base queries we have access to. For the sake of this tutorial, we're going to fetch a list of users using the workspace API. That said, you could run any query to fetch any data that you want!

```javascript
// Example GraphQL query for list of users
query {
  usersList {
  	items {
      email
      firstName
      lastName
      avatar {
        downloadUrl
      }
    }
  }
}
```

### Layout Components
The site we're going to build is super simple. It's for finding Mentors and has two pages – Mentors and About. The Mentors page will give a list of all our mentors, while the About page will do **EXACTLY** what About pages do. 

Remember how layouts are used to wrap Page components? Let's update the `Default.vue` layout with the following code.

```html
<!-- src/layouts/Default.vue -->
<template>
  <div class="container">
    <nav class="navbar" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <a class="navbar-item title" href="/">
          {{ $static.eightBase.companyName }}
        </a>
      </div>

      <div class="navbar-menu">
        <div class="navbar-start">
          <g-link class="navbar-item" to="/">
            Mentors
          </g-link>
          
          <g-link class="navbar-item" to="/about/">
            About
          </g-link>
        </div>
      </div>
    </nav>

    <hr>

    <!-- This is where the page gets slotted! -->
    <slot/>
  </div>
</template>

<static-query>
query {
  eightBase {
    companyName
  }
}
</static-query>

<style>
hr {
  margin: 0 0 1.5em 0 !important;
}
</style>
```

You're probably familiar with what happens in the `<template>` tags. Any code you put in there will be rendered in the default layout. Changing the position of the `<slot/>` tag will change where the routes Page component gets rendered. 

That all said, what's interesting here is the `<static-query>` component. In here, you're able to pass a GraphQL query that fetches data requested from any hooked up source – 8base in this case. The results can be accessed via the `$static` prop on the Vue instance and used to template the component that gets rendered.

*Note: the GraphQL query is executed and returned **before** the component is rendered. You don't need to worry about handling asynchronous API calls.*

### Pages Components
Since the Mentors page is the bread-and-butter of this app, let's create that page. While you could give it a specific name/route, you will create this page component at `src/pages/Index.vue`. This will set it as our home page by default.

```html
<!-- src/pages/Index.vue -->
<template>
  <Layout>
    <div class="content">
      <div class="card" v-for="user in $page.eightBase.usersList.items" :key="user.id">
        <div class="card-content columns">
          <div class="column is-2">
            <figure class="image">
              <img class="is-rounded" :src="avatarUrl(user.avatar)">
            </figure>
          </div>

          <div class="column">
            <p class="title"> {{ user.firstName }} {{ user.lastName }}</p>
            <p class="subtitle"> <i class="has-text-dark">Contact Email:</i> {{ user.email }}</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<page-query>
query {
  eightBase {
    usersList {
      items {
        email
        firstName
        lastName
        avatar {
          downloadUrl
        }
      }
    }
  }
}
</page-query>

<script>
export default {
  data() {
    return {
      catPic: "https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
    }
  },
  methods: {
    avatarUrl(obj) {
      return obj === null ? this.catPic : obj.downloadUrl
    }
  }
}
</script> 
```

This page's template is going to be slotted within the default `<Layout>` component. However, the new concept that we're looking at here is the `<page-query>` component. A `<page-query>` is for querying data and serves pretty much the same purpose as a `<static-query>`. It is specifically intended to be used in Pages and Templates, though.

Additionally, let's now add `src/pages/About.vue`, which will be available at `/about` path - because of its name. We'll use a query to provide a user count in the description.

```html
<!-- src/pages/About.vue -->
<template>
  <Layout class="content">
    <p class="title">
      Need a mentors? We have {{ $page.eightBase.usersList.count }} waiting to hear from you!
    </p>
    
    <hr>

    <a href="UPDATE THIS">Gridsome + 8base Repo Available here</a>
  </Layout>
</template>

<page-query>
query {
  eightBase {
    usersList {
        count
    }
  }
}
</page-query>

<script>
export default {
  metaInfo: {
    title: 'About | Mentor Index'
  }
}
</script>
```

One thing that we're also introducing here is the `metaInfo` object. Gridsome uses [vue-meta](https://vue-meta.nuxtjs.org/) for populating each page's meta tags. It's a convenient feature for setting everything from viewport tags to titles and descriptions!

At this point, you're already pretty equipped to start developing epic static sites using Gridsome. The only thing – from a 30,000-foot view - left to tackle is handling deployment!

### Deploying Sites
Tools like GitHub Pages, S3, and Netlify help in making static site deployment a breeze. Let's use Netlify for this rodeo. 

You can build your site locally by running `gridsome build` or have it done as part of a CI/CD pipeline. Since you're equipped to run the build command locally, lets instead set things up to build/deploy using Netlify.

To use [Netlify](https://netlify.com), we're going to need to create an account there. When doing so, **use single sign-on** with whichever provider your code repo will be kept on (GitHub, GitLab, or Bitbucket). Once that's done, make sure that you've committed and pushed your project to a remote repository (screenshots are of GitHub).

Now, jump over to Netlify and click the `New Site from Git` button. Choose the provider that hosts your repo under *Continuous Deployment* and allow the permissions asked, making sure either "All Repos" or the relevant repo is permitted to be managed.

For the config, set the *Build Command* to `gridsome build` and the *Publish Directory* to `dist`. 

Netlify will now try to build the site, but it will fail miserably. Why? We need to set our 8base environment variables! In Netlify, go to your projects `Settings > Build & Deploy > Environment Variables` and click `Edit Variables`. Set the same environment variables as we added to the `.env` file.

It's time to trigger the deploy manually and watch the build process kick-off and complete successfully. It should only take a minute or two and tell you afterward the "Site is Live."

BOOM! That's it. With this integration set up, simply merging/pushing changes into the master branch of your repo will trigger the build process and deploy the newest version of your site.

### Wrapping Up
So what did we cover? How to kick off your next static site project using Gridsome! In the process, we discussed what static site generators are, how Gridsome works, the basics of using Gridsome, querying data from a GraphQL API like [https://8base.com], and deploying your masterpiece to a service like [Netlify](https://netlify.com).

As is with any "Getting Started" piece, it's just the top of the ice-berg. I'd highly recommend that you further dive into the services we touched on by reading their docs and pushing their boundaries to build something that you're proud of!

* [8base](https://8base.com/)
* [Netlify](https://netlify.com/)
* [Gridsome](https://gridsome.org/)

All code that was shared in this tutorial is available at: https://github.com/8base/Tutorials/tree/master/getting-started-with-gridsome-and-graphql

