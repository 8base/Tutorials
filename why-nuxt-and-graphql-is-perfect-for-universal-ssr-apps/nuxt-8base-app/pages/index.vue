<template>
  <div>
    <div class="container">
      <div class="hero">
        <h1 class="title">
          Nuxt + {{ companyName }}
        </h1>

        <h2 class="subtitle">
          A Universal SSR App built using Nuxt and 8base GraphQL.
        </h2>
      </div>
    </div>

    <div class="container">
      <div class="section">
        <div class="card" v-for="article in articlesList.items" :key="article.id">

          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">{{ article.title }}</p>
                <p class="subtitle is-6">@someauthor</p>
              </div>
            </div>

            <div class="content">
              {{ article.body }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import companyQuery from '~/apollo/queries/company'
import articlesQuery from '~/apollo/queries/articles'

export default {
  apollo: {
    companyName: {
      prefetch: true,
      query: companyQuery
    },
    articlesList: {
      prefetch: true,
      query: articlesQuery
    },
  }
}
</script>

<style>
.container .hero {
  margin: 30px auto 0px;
  text-align: center;
}
</style>
