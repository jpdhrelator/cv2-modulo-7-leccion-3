<script setup>
</script>

<template>
    <div class="app">
        <header class="barra">
            <h1 class="marca">⚽ El Recinto </h1>

            <nav class="menu">
                <router-link :to="{ name: 'panel' }">Panel</router-link>
                <router-link :to="{ name: 'reservas' }">Agenda</router-link>
                <router-link :to="{ name: 'canchas' }">Canchas</router-link>
            </nav>

            <router-link class="boton-nueva" :to="{ name: 'reserva-nueva' }">
                + Nueva reserva
            </router-link>
        </header>
        <main class="contenido">
            <router-view />
        </main>
    </div>
</template>


<style scoped>
.app {
    min-height: 100vh;
    background: #f4f6f8;
    font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #1c2530;
}

.barra {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0 1.5rem;
    height: 60px;
    background: #1f2d3a;
    color: #fff;
    position: sticky;
    top: 0;
    z-index: 10;
}

.marca {
    font-size: 1.05rem;
    margin: 0;
    white-space: nowrap;
}

.menu {
    display: flex;
    gap: 0.5rem;
    flex: 1;
}

.menu a {
    color: #b9c7d4;
    text-decoration: none;
    padding: 0.5rem 0.9rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
}

.menu a:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
}

/*
  router-link-active la pone Vue Router SOLA en el enlace de la ruta
  activa. No inventes tu propia lógica de "cuál está seleccionado":
  ya está resuelto.

  Ojo con la diferencia:
    .router-link-active       → coincidencia parcial (/reservas/3 activa /reservas)
    .router-link-exact-active → coincidencia exacta
*/
.menu a.router-link-active {
    background: #2f8f66;
    color: #fff;
}

.boton-nueva {
    background: #42b883;
    color: #0b2418;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.88rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    white-space: nowrap;
}

.boton-nueva:hover {
    background: #55c795;
}

.contenido {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.75rem 1.5rem 4rem;
}

@media (max-width: 700px) {
    .barra {
        height: auto;
        flex-wrap: wrap;
        padding: 0.75rem 1rem;
    }

    .menu {
        order: 3;
        width: 100%;
    }
}
</style>