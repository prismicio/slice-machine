import { Box, Image, Input, Text, Label, Button } from 'theme-ui'

 const onChange = (e, componentInfo) => {
   const files = Array.from(e.target.files)
   const errs = []

   const formData = new FormData()
   const types = ['image/png', 'image/jpeg', 'image/gif']

   const file = files[0]
   if (types.every(type => file.type !== type)) {
     errs.push(`'${file.type}' is not a supported format`)
   }

   if (file.size > 150000) {
     errs.push(`'${file.name}' is too large, please pick a smaller file`)
   }

   formData.append('file', file)
   if (errs.length) {
     return console.error(errs)
   }
   formData.append('componentInfo', JSON.stringify(componentInfo))
   fetch(`/api/upload-preview`, {
      method: 'POST',
      body: formData
    })
    .then(res => {
      if (!res.ok) {
        throw res
      }
      return res.json()
    })
    .then(images => {
      console.log({ images })
    })
    .catch(err => {
      console.error({ err, here: true })
    })
 }

export default ({
  previewUrl,
  componentInfo,
  ...rest
}) => {

 return (
   <Box sx={{ border: t => `1px solid ${t.colors.primary}`, p: 4 }}>
     {
       previewUrl
        ? (<Image src={previewUrl} {...rest} />)
        : (
          <Text>No preview!</Text>
        )
     }
     <Button
      as={Label}
      htmlFor="file"
      sx={{ cursor: 'pointer' }}
      aria-label="Upload preview"
    >
        Choose file to upload
      </Button>
     <Input
      type="file"
      accept="image/png, image/jpeg"
      id="file"
      name="file"
      sx={{ display: 'none' }}
      onChange={e => onChange(e, componentInfo)}
    />
   </Box>
 )
}