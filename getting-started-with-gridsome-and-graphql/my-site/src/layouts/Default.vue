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