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