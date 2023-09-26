<script setup lang="ts">
import { Content } from "@prismicio/client";

defineProps(
  getSliceComponentProps<Content.RichTextSlice>([
    "slice",
    "index",
    "slices",
    "context",
  ])
);
</script>

<template>
  <section
    :data-slice-type="slice.slice_type"
    :data-slice-variation="slice.variation"
    class="es-bounded es-fullpage-hero es-bounded__content es-fullpage-hero__content"
    :class="
      slice.variation === 'imageRight'
        ? 'es-fullpage-hero__image--right'
        : 'es-fullpage-hero__image--left'
    "
  >
    <PrismicImage
      v-if="$prismic.isFilled.image(slice.primary.image)"
      :field="slice.primary.image"
      class="es-fullpage-hero__image"
    />
    <div class="es-fullpage-hero__content-right">
      <div class="es-fullpage-hero__content__intro">
        <p
          v-if="$prismic.isFilled.keyText(slice.primary.eyebrowHeadline)"
          class="es-fullpage-hero__content__intro__eyebrow"
        >
          {{ slice.primary.eyebrowHeadline }}
        </p>
        <PrismicRichText
          v-if="$prismic.isFilled.richText(slice.primary.title)"
          class="es-fullpage-hero__content__intro__headline"
          :field="slice.primary.title"
        />
      </div>
      <PrismicRichText
        v-if="$prismic.isFilled.richText(slice.primary.description)"
        class="es-fullpage-hero__content__intro__description"
        :field="slice.primary.description"
      />
    </div>
  </section>
</template>

<style>
.es-bounded {
  margin: 0px;
  min-width: 0px;
  position: relative;
}

.es-bounded-content {
  min-width: 0px;
  max-width: 90%;
  margin: 0px auto;
}

.es-fullpage-hero {
  font-family: system-ui, sans-serif;
  background-color: #fff;
  color: #333;
}

.es-fullpage-hero__image {
  max-width: 100%;
  height: auto;
  align-self: center;
}

.es-fullpage-hero__image--left > div:first-child {
  order: 1;
}

.es-fullpage-hero__image--left > div:nth-child(2) {
  order: 2;
}

.es-fullpage-hero__image--right > div:first-child {
  order: 2;
}

.es-fullpage-hero__image--right > div:nth-child(2) {
  order: 1;
}

.es-fullpage-hero__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.es-fullpage-hero__content-right {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 1.5rem;
}

@media (min-width: 1080px) {
  .es-fullpage-hero__content {
    flex-direction: row;
  }

  .es-fullpage-hero__content > div {
    width: 50%;
  }
}

.es-fullpage-hero__content-right__intro {
  margin-top: -2rem;
  display: grid;
  gap: 0.5rem;
}

.es-fullpage-hero__content__intro {
  display: grid;
  gap: 1rem;
}

.es-fullpage-hero__content__intro__eyebrow {
  color: #47c1af;
  font-size: 1.15rem;
  font-weight: 500;
  margin: 0;
}

.es-fullpage-hero__content__intro__headline {
  font-size: 1.625rem;
  font-weight: 700;
}

.es-fullpage-hero__content__intro__headline > * {
  margin: 0;
}

@media (min-width: 640px) {
  .es-fullpage-hero__content__intro__headline {
    font-size: 2rem;
  }
}

@media (min-width: 1024px) {
  .es-fullpage-hero__content__intro__headline {
    font-size: 2.5rem;
  }
}

@media (min-width: 1200px) {
  .es-fullpage-hero__content__intro__headline {
    font-size: 2.75rem;
  }
}

.es-fullpage-hero__content__intro__description {
  font-size: 1.15rem;
  max-width: 38rem;
}

.es-fullpage-hero__content__intro__description > p {
  margin: 0;
}

@media (min-width: 1200px) {
  .es-fullpage-hero__content__intro__description {
    font-size: 1.4rem;
  }
}

.es-fullpage-hero__content__items {
  display: grid;
  gap: 2rem;
}

@media (min-width: 640px) {
  .es-fullpage-hero__content__items {
    grid-template-columns: repeat(2, 1fr);
  }
}

.es-fullpage-hero__item {
  display: grid;
  align-content: start;
}

.es-fullpage-hero__item__icon {
  max-height: 3rem;
}

.es-fullpage-hero__item__heading {
  font-weight: 700;
  font-size: 1.17rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.es-fullpage-hero__item__heading > * {
  margin: 0;
}

.es-fullpage-hero__item__description {
  font-size: 0.9rem;
}

.es-fullpage-hero__item__description > * {
  margin: 0;
}

.es-call-to-action__link {
  justify-self: flex-start;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.3;
  padding: 1rem 2.625rem;
  transition: background-color 100ms linear;
  background-color: #16745f;
  color: #fff;
}

.es-call-to-action__link:hover {
  background-color: #0d5e4c;
}
</style>
