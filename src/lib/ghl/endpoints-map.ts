/**
 * Comprehensive GoHighLevel API Endpoints Map
 * Based on official API documentation
 */

export const GHL_API_ENDPOINTS = {
  // Contacts API
  contacts: {
    list: 'GET /contacts',
    get: 'GET /contacts/:contactId',
    create: 'POST /contacts',
    update: 'PUT /contacts/:contactId',
    delete: 'DELETE /contacts/:contactId',
    upsert: 'POST /contacts/upsert',
    getByPhone: 'GET /contacts/lookup?phone=:phone',
    getByEmail: 'GET /contacts/lookup?email=:email',
    bulkUpdate: 'POST /contacts/bulk/business',
    
    // Tags
    addTags: 'POST /contacts/:contactId/tags',
    removeTags: 'DELETE /contacts/:contactId/tags',
    
    // Tasks
    getTasks: 'GET /contacts/:contactId/tasks',
    createTask: 'POST /contacts/:contactId/tasks',
    updateTask: 'PUT /contacts/:contactId/tasks/:taskId',
    deleteTask: 'DELETE /contacts/:contactId/tasks/:taskId',
    
    // Notes
    getNotes: 'GET /contacts/:contactId/notes',
    createNote: 'POST /contacts/:contactId/notes',
    updateNote: 'PUT /contacts/:contactId/notes/:noteId',
    deleteNote: 'DELETE /contacts/:contactId/notes/:noteId',
    
    // Appointments
    getAppointments: 'GET /contacts/:contactId/appointments',
    
    // Workflows
    addToWorkflow: 'POST /contacts/:contactId/workflow/:workflowId',
    removeFromWorkflow: 'DELETE /contacts/:contactId/workflow/:workflowId',
    
    // Followers
    addFollowers: 'POST /contacts/:contactId/followers',
    removeFollowers: 'DELETE /contacts/:contactId/followers',
    
    // Campaigns
    addToCampaign: 'POST /contacts/:contactId/campaigns/:campaignId',
    removeFromCampaign: 'DELETE /contacts/:contactId/campaigns/:campaignId',
    removeFromAllCampaigns: 'DELETE /contacts/:contactId/campaigns',
  },

  // Conversations API
  conversations: {
    search: 'GET /conversations/search',
    get: 'GET /conversations/:conversationId',
    create: 'POST /conversations',
    update: 'PUT /conversations/:conversationId',
    delete: 'DELETE /conversations/:conversationId',
    
    // Messages
    getMessages: 'GET /conversations/:conversationId/messages',
    sendMessage: 'POST /conversations/messages',
    getMessage: 'GET /conversations/messages/:messageId',
    updateMessage: 'PUT /conversations/messages/:messageId',
    deleteMessage: 'DELETE /conversations/messages/:messageId',
    updateMessageStatus: 'PUT /conversations/messages/:messageId/status',
    
    // Message Types (all use POST /conversations/messages with type field)
    sendSMS: 'POST /conversations/messages (type: SMS)',
    sendEmail: 'POST /conversations/messages (type: Email)', 
    sendWhatsApp: 'POST /conversations/messages (type: WhatsApp)',
    sendFacebook: 'POST /conversations/messages (type: FB)',
    sendInstagram: 'POST /conversations/messages (type: IG)',
    sendGoogleBusinessMessages: 'POST /conversations/messages (type: GMB)',
    
    // Special
    addInbound: 'POST /conversations/messages/inbound',
    addCall: 'POST /conversations/messages/outbound',
    cancelScheduled: 'DELETE /conversations/messages/:messageId/schedule',
    uploadAttachment: 'POST /conversations/messages/upload',
    recordingUrl: 'GET /conversations/messages/:messageId/recording',
    transcription: 'GET /conversations/messages/:messageId/transcription',
  },

  // Calendars API
  calendars: {
    list: 'GET /calendars',
    get: 'GET /calendars/:calendarId',
    create: 'POST /calendars',
    update: 'PUT /calendars/:calendarId',
    delete: 'DELETE /calendars/:calendarId',
    
    // Free Slots
    getFreeSlots: 'GET /calendars/:calendarId/free-slots',
    
    // Groups
    getGroups: 'GET /calendars/groups',
    getGroup: 'GET /calendars/groups/:groupId',
    createGroup: 'POST /calendars/groups',
    updateGroup: 'PUT /calendars/groups/:groupId',
    deleteGroup: 'DELETE /calendars/groups/:groupId',
    disableGroup: 'DELETE /calendars/groups/:groupId/status',
    enableGroup: 'PUT /calendars/groups/:groupId/status',
    
    // Events/Appointments
    getEvents: 'GET /calendars/events',
    getEvent: 'GET /calendars/events/:eventId',
    createAppointment: 'POST /calendars/events/appointments',
    getAppointment: 'GET /calendars/events/appointments/:eventId',
    updateAppointment: 'PUT /calendars/events/appointments/:eventId',
    deleteAppointment: 'DELETE /calendars/events/appointments/:eventId',
    
    // Blocks
    createBlock: 'POST /calendars/events/blocks',
    updateBlock: 'PUT /calendars/events/blocks/:eventId',
    deleteBlock: 'DELETE /calendars/events/blocks/:eventId',
  },

  // Opportunities/Pipelines API
  opportunities: {
    search: 'GET /opportunities/search',
    get: 'GET /opportunities/:opportunityId',
    create: 'POST /opportunities',
    update: 'PUT /opportunities/:opportunityId',
    delete: 'DELETE /opportunities/:opportunityId',
    updateStatus: 'PUT /opportunities/:opportunityId/status',
    upsert: 'POST /opportunities/upsert',
    
    // Pipelines
    getPipelines: 'GET /opportunities/pipelines',
    
    // Followers
    addFollowers: 'POST /opportunities/:opportunityId/followers',
    removeFollowers: 'DELETE /opportunities/:opportunityId/followers',
  },

  // Locations API
  locations: {
    get: 'GET /locations/:locationId',
    update: 'PUT /locations/:locationId',
    
    // Custom Values
    getCustomValues: 'GET /locations/:locationId/customValues',
    createCustomValue: 'POST /locations/:locationId/customValues',
    updateCustomValue: 'PUT /locations/:locationId/customValues/:customValueId',
    deleteCustomValue: 'DELETE /locations/:locationId/customValues/:customValueId',
    
    // Custom Fields
    getCustomFields: 'GET /locations/:locationId/customFields',
    createCustomField: 'POST /locations/:locationId/customFields',
    updateCustomField: 'PUT /locations/:locationId/customFields/:customFieldId',
    deleteCustomField: 'DELETE /locations/:locationId/customFields/:customFieldId',
    
    // Tags
    getTags: 'GET /locations/:locationId/tags',
    createTag: 'POST /locations/:locationId/tags',
    updateTag: 'PUT /locations/:locationId/tags/:tagId',
    deleteTag: 'DELETE /locations/:locationId/tags/:tagId',
    
    // Templates
    getTemplates: 'GET /locations/:locationId/templates',
    deleteTemplate: 'DELETE /locations/:locationId/templates/:templateId',
    
    // Tasks
    getTasks: 'GET /locations/:locationId/tasks',
    createTask: 'POST /locations/:locationId/tasks',
    updateTask: 'PUT /locations/:locationId/tasks/:taskId',
    deleteTask: 'DELETE /locations/:locationId/tasks/:taskId',
    
    // Snippets
    getSnippets: 'GET /locations/:locationId/snippets',
    createSnippet: 'POST /locations/:locationId/snippets',
    deleteSnippet: 'DELETE /locations/:locationId/snippets/:snippetId',
  },

  // Users API
  users: {
    list: 'GET /users',
    get: 'GET /users/:userId',
    create: 'POST /users',
    update: 'PUT /users/:userId',
    delete: 'DELETE /users/:userId',
    getByEmail: 'GET /users/email/:email',
    
    // Permissions
    getPermissions: 'GET /users/:userId/permissions',
    updatePermissions: 'PUT /users/:userId/permissions',
    
    // Roles
    getRoles: 'GET /users/:userId/roles',
    assignRole: 'POST /users/:userId/roles',
    removeRole: 'DELETE /users/:userId/roles/:roleId',
    
    // Teams
    getTeams: 'GET /teams',
    createTeam: 'POST /teams',
    updateTeam: 'PUT /teams/:teamId',
    deleteTeam: 'DELETE /teams/:teamId',
  },

  // Forms API
  forms: {
    list: 'GET /forms',
    create: 'POST /forms',
    update: 'PUT /forms/:formId',
    delete: 'DELETE /forms/:formId',
    
    // Submissions
    getSubmissions: 'GET /forms/:formId/submissions',
    createSubmission: 'POST /forms/:formId/submissions',
    updateSubmission: 'PUT /forms/:formId/submissions/:submissionId',
    deleteSubmission: 'DELETE /forms/:formId/submissions/:submissionId',
  },

  // Surveys API
  surveys: {
    list: 'GET /surveys',
    create: 'POST /surveys',
    update: 'PUT /surveys/:surveyId',
    delete: 'DELETE /surveys/:surveyId',
    
    // Submissions
    getSubmissions: 'GET /surveys/:surveyId/submissions',
    createSubmission: 'POST /surveys/:surveyId/submissions',
    updateSubmission: 'PUT /surveys/:surveyId/submissions/:submissionId',
    deleteSubmission: 'DELETE /surveys/:surveyId/submissions/:submissionId',
  },

  // Workflows API
  workflows: {
    list: 'GET /workflows',
    get: 'GET /workflows/:workflowId',
  },

  // Campaigns API
  campaigns: {
    list: 'GET /campaigns',
    get: 'GET /campaigns/:campaignId',
  },

  // Social Planner API
  socialPlanner: {
    // Posts
    searchPosts: 'GET /social-media-posting/posts',
    createPost: 'POST /social-media-posting/posts',
    getPost: 'GET /social-media-posting/posts/:postId',
    updatePost: 'PUT /social-media-posting/posts/:postId',
    deletePost: 'DELETE /social-media-posting/posts/:postId',
    bulkDelete: 'POST /social-media-posting/posts/bulk-delete',
    
    // Accounts
    getAccounts: 'GET /social-media-posting/accounts',
    deleteAccount: 'DELETE /social-media-posting/accounts/:accountId',
    startOAuth: 'GET /social-media-posting/oauth/start',
    
    // CSV
    uploadCSV: 'POST /social-media-posting/csv/upload',
    getUploadStatus: 'GET /social-media-posting/csv/:uploadId/status',
    setAccounts: 'POST /social-media-posting/csv/:uploadId/accounts',
    
    // Categories & Tags
    getCategories: 'GET /social-media-posting/categories',
    getTags: 'GET /social-media-posting/tags',
    getTagsByIds: 'POST /social-media-posting/tags/bulk',
    
    // Review
    reviewPost: 'POST /social-media-posting/posts/:postId/review',
    updateReviewStatus: 'PUT /social-media-posting/posts/:postId/review-status',
  },

  // Invoices API
  invoices: {
    // Templates
    listTemplates: 'GET /invoices/templates',
    createTemplate: 'POST /invoices/templates',
    getTemplate: 'GET /invoices/templates/:templateId',
    updateTemplate: 'PUT /invoices/templates/:templateId',
    deleteTemplate: 'DELETE /invoices/templates/:templateId',
    
    // Schedules
    listSchedules: 'GET /invoices/schedules',
    createSchedule: 'POST /invoices/schedules',
    getSchedule: 'GET /invoices/schedules/:scheduleId',
    updateSchedule: 'PUT /invoices/schedules/:scheduleId',
    deleteSchedule: 'DELETE /invoices/schedules/:scheduleId',
    scheduleInvoice: 'POST /invoices/schedules/:scheduleId/schedule',
    cancelSchedule: 'POST /invoices/schedules/:scheduleId/cancel',
    
    // Invoices
    list: 'GET /invoices',
    create: 'POST /invoices',
    get: 'GET /invoices/:invoiceId',
    update: 'PUT /invoices/:invoiceId',
    delete: 'DELETE /invoices/:invoiceId',
    void: 'POST /invoices/:invoiceId/void',
    send: 'POST /invoices/:invoiceId/send',
    recordPayment: 'POST /invoices/:invoiceId/record-payment',
    generateNumber: 'GET /invoices/generate-number',
    text2pay: 'POST /invoices/:invoiceId/text2pay',
  },

  // Payments API
  payments: {
    // Orders
    listOrders: 'GET /payments/orders',
    getOrder: 'GET /payments/orders/:orderId',
    
    // Transactions
    listTransactions: 'GET /payments/transactions',
    getTransaction: 'GET /payments/transactions/:transactionId',
    
    // Subscriptions
    listSubscriptions: 'GET /payments/subscriptions',
    getSubscription: 'GET /payments/subscriptions/:subscriptionId',
    
    // Integration
    listIntegrations: 'GET /payments/integrations',
    createIntegration: 'POST /payments/integrations',
    deleteIntegration: 'DELETE /payments/integrations/:integrationId',
    
    // Coupons
    listCoupons: 'GET /products/coupons',
    createCoupon: 'POST /products/coupons',
    getCoupon: 'GET /products/coupons/:couponId',
    updateCoupon: 'PUT /products/coupons/:couponId',
    deleteCoupon: 'DELETE /products/coupons/:couponId',
  },

  // Products API
  products: {
    list: 'GET /products',
    create: 'POST /products',
    get: 'GET /products/:productId',
    update: 'PUT /products/:productId',
    delete: 'DELETE /products/:productId',
    
    // Prices
    listPrices: 'GET /products/:productId/prices',
    createPrice: 'POST /products/:productId/prices',
    getPrice: 'GET /products/:productId/prices/:priceId',
    updatePrice: 'PUT /products/:productId/prices/:priceId',
    deletePrice: 'DELETE /products/:productId/prices/:priceId',
  },

  // Custom Objects API
  customObjects: {
    list: 'GET /objects',
    createSchema: 'POST /objects/schemas',
    getSchema: 'GET /objects/schemas/:schemaId',
    updateSchema: 'PUT /objects/schemas/:schemaId',
    
    // Records
    createRecord: 'POST /objects/records',
    getRecord: 'GET /objects/records/:recordId',
    updateRecord: 'PUT /objects/records/:recordId',
    deleteRecord: 'DELETE /objects/records/:recordId',
    searchRecords: 'POST /objects/records/search',
  },

  // Blogs API
  blogs: {
    listPosts: 'GET /blogs',
    createPost: 'POST /blogs',
    getPost: 'GET /blogs/:postId',
    updatePost: 'PUT /blogs/:postId',
    deletePost: 'DELETE /blogs/:postId',
    
    // Meta
    getSites: 'GET /blogs/sites',
    getAuthors: 'GET /blogs/authors',
    getCategories: 'GET /blogs/categories',
    checkSlug: 'GET /blogs/check-slug',
  },

  // Media/Files API
  media: {
    list: 'GET /medias',
    upload: 'POST /medias/upload',
    get: 'GET /medias/:mediaId',
    delete: 'DELETE /medias/:mediaId',
  },

  // Links API
  links: {
    list: 'GET /links',
    create: 'POST /links',
    get: 'GET /links/:linkId',
    update: 'PUT /links/:linkId',
    delete: 'DELETE /links/:linkId',
  },

  // Funnels API
  funnels: {
    list: 'GET /funnels',
    listPages: 'GET /funnels/pages',
    listRedirects: 'GET /funnels/redirects',
    getPageCount: 'GET /funnels/page/count',
  },

  // Courses API
  courses: {
    list: 'GET /courses',
    create: 'POST /courses',
    get: 'GET /courses/:courseId',
    update: 'PUT /courses/:courseId',
    delete: 'DELETE /courses/:courseId',
  },

  // Communities API
  communities: {
    list: 'GET /communities',
    create: 'POST /communities',
    get: 'GET /communities/:communityId',
    update: 'PUT /communities/:communityId',
    delete: 'DELETE /communities/:communityId',
  },

  // Email Builder API
  emailBuilder: {
    list: 'GET /emails/builder',
    create: 'POST /emails/builder',
    get: 'GET /emails/builder/:emailId',
    update: 'PUT /emails/builder/:emailId',
    delete: 'DELETE /emails/builder/:emailId',
  },

  // OAuth API
  oauth: {
    getInstalledLocations: 'GET /oauth/installedLocations',
    getLocationAccessToken: 'POST /oauth/locationToken',
  },

  // RL Integration (Custom)
  rl: {
    conversationTranscripts: 'GET /rl/conversation-transcripts',
    contactJourney: 'GET /rl/contact-journey',
  }
};