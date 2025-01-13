<template>
  <header class="header">
    <div class="logo"> <img src="@/assets/fn2logo.png" alt="FishNet2 Logo" /></div>
    <nav class="nav">
      <a href="#" class="nav-link">HOME</a>
      <a href="#" class="nav-link">SEARCH</a>
      <a href="#" class="nav-link">TEAM</a>
      <a href="#" class="nav-link">ABOUT</a>
    </nav>
  </header>
</template>

<script>
export default {};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter+Rounded:wght@400;500;600&display=swap');
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  background-color: #ffffff;
}

.logo {
  font-size: 1.2rem;
  font-weight: 500;
  color: #0077ff;
}
.logo img {
  height: 40px; /* 调整 Logo 高度 */
}
.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  font-family: 'Inter Rounded', sans-serif;
  font-weight: 500; /* Medium */
  font-size: 16px;
  color: #004B8D; /* 深蓝色 */
  letter-spacing: 0.5px;
  text-decoration: none;
}

.nav-link:hover {
  text-decoration: underline;
  color: #002B5C;
}
</style>
