<template lang="pug">
div
  span {{ text }}
  el-button.copy-button(
    icon="el-icon-document-copy"
    size="small"
    @click="() => copyContent(text)"
  )
</template>

<script>
export default {
  props: {
    text: String,
    copiedMessage: {
      type: String,
      default: 'in die Zwischenablage kopiert'
    }
  },
  methods: {
    copyToClipboard(str) {
      // Create new element
      const el = document.createElement('textarea')
      // Set value (string to be copied)
      el.value = str
      // Set non-editable to avoid focus and move outside of view
      el.setAttribute('readonly', '')
      el.style = { position: 'absolute', left: '-9999px' }
      document.body.appendChild(el)
      // Select text inside element
      el.select()
      // Copy text to clipboard
      document.execCommand('copy')
      // Remove temporary element
      document.body.removeChild(el)
    },
    copyContent(str) {
      this.copyToClipboard(str)
      this.$message(this.copiedMessage)
    }
  }
}
</script>

<style lang="sass" scoped>
.copy-button
  margin-left: 0.4em
  height: 1.9em
  padding: 0.4em 1em 0.4em 1em
</style>
