const images = [
  'https://images.prismic.io/important-sm-images/5f387305-9347-4f59-ab1a-e611a77a65a3_lnWytzi3f8g.jpg',
  'https://images.prismic.io/important-sm-images/172b5eb6-3c1a-4459-84b7-3daf60c144a5_dT-3aKJyxvE.jpg',
  'https://images.prismic.io/important-sm-images/5782503d-59e4-4a8a-bc4f-0388ee5b7a3d_Nhm0Uj5U7wc.jpg',
  'https://images.prismic.io/important-sm-images/4ac0a22f-06e4-400c-8b1f-29bb64d3bbe7_1IqWqCzYJPs.jpg',
  'https://images.prismic.io/important-sm-images/2df10730-6c0d-43fc-8a41-2f457d6b561f_KDxa0jt2UyI.jpg',
  'https://images.prismic.io/important-sm-images/0e692ba3-b5e5-4c5b-a025-bf61d155847f_lqGMN0NRiIo.jpg',
  'https://images.prismic.io/important-sm-images/0bd90f52-eede-4191-a9d2-6828ccf38e81_T19__iPV4hQ.jpg',
  'https://images.prismic.io/important-sm-images/67afbbc0-7120-4f89-bb6c-cc5e44860cb1_Eg83MVKYwGY.jpg',
  'https://images.prismic.io/important-sm-images/a088b747-ac0d-4ed4-9407-b9555a3de82e_o9Y-bfgbtjg.jpg',
  'https://images.prismic.io/important-sm-images/27994ed7-23c8-46b9-a039-930fb3747e06_hTb8Vd3elEY.jpg',
  'https://images.prismic.io/important-sm-images/b392a962-5824-424f-9d87-162541436f98_h0xKqdDPLaE.jpg',
  'https://images.prismic.io/important-sm-images/5ed52ff8-2b57-43e4-b9c3-da748eccd6e5_qDE_W1ameSY.jpg',
  'https://images.prismic.io/important-sm-images/3d004e4f-9a5c-49b4-9da7-782d2603f6be_S_M_yDChHkc.jpg',
  'https://images.prismic.io/important-sm-images/716c22ba-9d06-4d2e-b1e5-014cfb0c1051_hWVknfUP7cc.jpg',
  'https://images.prismic.io/important-sm-images/05b6c285-b5a7-4034-aa4c-79d41670c3a8_rfS6oq6MWlU.jpg',
  'https://images.prismic.io/important-sm-images/ef4ce910-e149-4b05-b0c7-dc75c3563b1a_LyvvCwJjRz0.jpg',
  'https://images.prismic.io/important-sm-images/9064f651-d993-47e0-82f6-606255af427d_G74n9VZ5ves.jpg',
  'https://images.prismic.io/important-sm-images/e715a30d-4dbd-4960-8343-7ebdaeef1da8_qKM6rVckY3c.jpg',
  'https://images.prismic.io/important-sm-images/dda8cb48-7713-43c1-8fe7-07901544516b_U9ip7K_26zw.jpg',
  'https://images.prismic.io/important-sm-images/f4e07b66-b898-45ad-a6b8-b4e691c24735_j0l_J0YGXdo.jpg',
  'https://images.prismic.io/important-sm-images/dbd62be9-4ba7-4efe-85ac-a2daf6f297f8_3IpWM9N5_aI.jpg',
  'https://images.prismic.io/important-sm-images/4777dcba-bd40-4239-95cf-3a705d442525_mq1krqPvsLs.jpg',
  'https://images.prismic.io/important-sm-images/90501dd7-8c50-43d4-a20a-f001a60e6ac1_j_HYcjKUZrk.jpg',
  'https://images.prismic.io/important-sm-images/bc3666e1-3430-4cbd-8b57-6edf2cc6ceab_PSxIoipDUZ4.jpg',
  'https://images.prismic.io/important-sm-images/0e665171-82db-4865-9305-d0885a35db49_eFNybOZupwc.jpg',
  'https://images.prismic.io/important-sm-images/ef51bfb6-48fc-4d99-9ca9-a73ab1ff6b25__vQuvwCEtNM.jpg',
  'https://images.prismic.io/important-sm-images/22ff89b3-1f05-4d7a-8cb5-c362dedaae22_3XSuPA5WXAk.jpg',
  'https://images.prismic.io/important-sm-images/ff13084f-fe0a-40bd-aa68-0e26ba6ffe7e_7elOvDgVoxg.jpg',
  'https://images.prismic.io/important-sm-images/917926e0-4ebc-4f8a-92e2-70e0168486b3_fz5ClUtxziI.jpg',
  'https://images.prismic.io/important-sm-images/4b7f2693-f585-4740-9980-3656c4c72dec_JXow53j6AtE.jpg',
  'https://images.prismic.io/important-sm-images/1e9d5359-fe8c-40b0-9a18-08dffb2311e9_5KxHdybrEyQ.jpg',
  'https://images.prismic.io/important-sm-images/15c70ce3-fa6c-4951-8ce9-269d6e8263b2_1-dAxyaDXf8.jpg',
  'https://images.prismic.io/important-sm-images/ef9ad315-8fee-4074-aab6-e12970a1644c_yNB8niq1qCk.jpg',
  'https://images.prismic.io/important-sm-images/8eb81fa6-3408-4f2a-a856-8319ca2b6f8c_YbGMa1Jz1yY.jpg',
  'https://images.prismic.io/important-sm-images/a97d6a71-8f4d-412e-94f5-22e8675713c2_Tir2gkW3mYs.jpg',
  'https://images.prismic.io/important-sm-images/3cb5cb2f-275d-4608-a48b-dc9739abcc93_OceJpLdGQdE.jpg',
  'https://images.prismic.io/important-sm-images/15fd0037-cfff-4efa-a7a0-cbb9fafd5753_-VKgcOWML4k.jpg',
  'https://images.prismic.io/important-sm-images/5dfefc03-62cf-4d72-a6d4-21df65989147_tjpzudpoaMs.jpg',
  'https://images.prismic.io/important-sm-images/6b114b05-c3fd-46b7-bf07-079bcfc3fcce_QHy3ixe40Ic.jpg',
  'https://images.prismic.io/important-sm-images/5d998b82-32ee-4a44-b31e-07414eb2b96f_PI7FJJjGtt4.jpg',
  'https://images.prismic.io/important-sm-images/e6aa48f6-f5b3-43b9-af72-a0e950297976_OxsU3hHvG90.jpg',
  'https://images.prismic.io/important-sm-images/dec29fb6-148b-4715-9f71-30b5cea3fcec_pXEskkt0tpg.jpg',
  'https://images.prismic.io/important-sm-images/f9415b28-d28b-4536-8439-eba4ea388b5c_pH-nXzeOvlk.jpg',
  'https://images.prismic.io/important-sm-images/4dde2a84-3496-49d9-a176-9a6ad245b147_7yCUmPAZrhc.jpg',
  'https://images.prismic.io/important-sm-images/ab386e16-bd83-414f-84dc-8b006fbac0f6_7AFC_EoBMj8.jpg',
  'https://images.prismic.io/important-sm-images/127420c8-a520-4aae-a2da-b57b0c163ff3_WV0x4C4JV8A.jpg',
  'https://images.prismic.io/important-sm-images/85ca1e48-d992-44e6-846f-4e11ae6b7d39_ik8tQRvq6us.jpg',
  'https://images.prismic.io/important-sm-images/58805194-78f8-4f89-abca-4b3a270ad365_jef0ubjI_Hs.jpg',
  'https://images.prismic.io/important-sm-images/0be9cf2b-fb56-44f2-8a28-6569845c633b_NP-pwHBvCYE.jpg',
  'https://images.prismic.io/important-sm-images/dc35ef90-3f97-49a5-a22a-3fb86373dfef_Ka9WMJqV8E8.jpg',
  'https://images.prismic.io/important-sm-images/ab0e7b32-7bb3-4aab-b809-f83becd39ebb_IlyYCgkZnBo.jpg',
  'https://images.prismic.io/important-sm-images/0c1acf72-dbfa-442a-8a64-ab8c84d41263_jZ4rJ0yLyrs.jpg',
  'https://images.prismic.io/important-sm-images/7e42d190-3adc-465f-bcbb-f9f1e695cf92_eBK_iVWuY-Y.jpg',
  'https://images.prismic.io/important-sm-images/e9af888c-3575-4a25-93c3-e70b7e6618fe_HN0tPzaZJNA.jpg',
  'https://images.prismic.io/important-sm-images/84f7f74e-e770-47af-b005-d11d83de4dd0_EvvzDTUNiHE.jpg',
  'https://images.prismic.io/important-sm-images/fcad8474-a4b4-40f9-a34c-ab36ceb59593__fC4opfkUz8.jpg',
  'https://images.prismic.io/important-sm-images/679c89df-30db-490c-a287-f66348ac8d71_BocBGm1zoOw.jpg',
  'https://images.prismic.io/important-sm-images/0ade35fa-6281-4c99-9490-351b798227d8_c8PWkB1JbMI.jpg',
  'https://images.prismic.io/important-sm-images/02c0841a-df5d-4967-8480-d3a758596191_-PyYwZf0SP0.jpg',
  'https://images.prismic.io/important-sm-images/26830a3b-29e9-4cd2-84ca-c7313bd92d00_3Ip5Hox_Cro.jpg',
]

const createImageArray = ({ src, thumbs = [] }, constraint = {}, thumbnails = []) => {
  const { width = 900, height = 500 } = constraint
  return {
    dimensions: { width, height },
    alt: 'Placeholder image',
    copyright: null,
    url: src || `${images[Math.floor(Math.random() * images.length)]}?w=${width}&h=${height}&fit=crop`,
    ...thumbnails.reduce((acc, e, i) => ({
      ...acc,
      [e.name]: createImageArray({ src: thumbs[i] || src }, { width: e.width, height: e.height })
    }), [])
  }
}

export const handleMockContent = (mockContent, { constraint, thumbnails }) => {
  if (!Array.isArray(mockContent)) {
    const args = [
      { src: typeof mockContent === 'string' ? mockContent : mockContent.src || mockContent.url },
      mockContent.constraint || constraint,
      mockContent.thumbnails || thumbnails
    ]
    return createImageArray(...args)
  }
  const args = [
      {
        src: mockContent[0],
        thumbs: mockContent.slice(1)
      },
      constraint,
      thumbnails
    ]
    return createImageArray(...args)
}

export const createMock = (model) => createImageArray({ src: null }, model.constraint, model.thumbnails)