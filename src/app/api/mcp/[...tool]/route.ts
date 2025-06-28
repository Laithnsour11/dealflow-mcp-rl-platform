/**
 * Multi-Tenant MCP API Endpoints
 * Handles all GHL MCP operations with tenant authentication and isolation
 */

import { NextRequest, NextResponse } from 'next/server'
import { tenantAuth } from '@/lib/auth/tenant-auth'
import { createTenantGHLClient } from '@/lib/ghl/tenant-client-v2'
import { createTenantGHLClientFixed } from '@/lib/ghl/create-client-fix'

// Available MCP tools mapping - 269 total tools
const MCP_TOOLS = {
  // Contact Management (31 tools)
  'search_contacts': 'searchContacts',
  'get_contact': 'getContact',
  'create_contact': 'createContact',
  'update_contact': 'updateContact',
  'delete_contact': 'deleteContact',
  'upsert_contact': 'upsertContact',
  'get_duplicate_contact': 'getDuplicateContact',
  'add_contact_tags': 'addContactTags',
  'remove_contact_tags': 'removeContactTags',
  'bulk_update_contact_tags': 'bulkUpdateContactTags',
  'get_contact_tasks': 'getContactTasks',
  'create_contact_task': 'createContactTask',
  'update_contact_task': 'updateContactTask',
  'delete_contact_task': 'deleteContactTask',
  'get_contact_notes': 'getContactNotes',
  'create_contact_note': 'createContactNote',
  'update_contact_note': 'updateContactNote',
  'delete_contact_note': 'deleteContactNote',
  'add_contact_to_workflow': 'addContactToWorkflow',
  'remove_contact_from_workflow': 'removeContactFromWorkflow',
  'add_contact_followers': 'addContactFollowers',
  'remove_contact_followers': 'removeContactFollowers',
  'get_contact_appointments': 'getContactAppointments',
  'get_contact_campaigns': 'getContactCampaigns',
  'get_contact_activities': 'getContactActivities',
  'get_contact_by_email': 'getContactByEmail',
  'get_contact_by_phone': 'getContactByPhone',
  'merge_contacts': 'mergeContacts',
  'get_contact_custom_fields': 'getContactCustomFields',
  'update_contact_custom_fields': 'updateContactCustomFields',
  'get_contact_timeline': 'getContactTimeline',

  // Messaging & Conversations (20 tools)
  'search_conversations': 'searchConversations',
  'get_conversation': 'getConversation',
  'create_conversation': 'createConversation',
  'send_sms': 'sendSMS',
  'send_email': 'sendEmail',
  'send_whatsapp': 'sendWhatsApp',
  'send_facebook_message': 'sendFacebookMessage',
  'send_instagram_message': 'sendInstagramMessage',
  'get_message': 'getMessage',
  'get_email_message': 'getEmailMessage',
  'upload_message_attachments': 'uploadMessageAttachments',
  'update_message_status': 'updateMessageStatus',
  'cancel_scheduled_message': 'cancelScheduledMessage',
  'get_message_recording': 'getMessageRecording',
  'get_message_transcription': 'getMessageTranscription',
  'download_transcription': 'downloadTranscription',
  'add_inbound_message': 'addInboundMessage',
  'add_outbound_call': 'addOutboundCall',
  'live_chat_typing': 'liveChatTyping',
  'assign_conversation': 'assignConversation',

  // Blog Management (7 tools)
  'create_blog_post': 'createBlogPost',
  'update_blog_post': 'updateBlogPost',
  'get_blog_posts': 'getBlogPosts',
  'get_blog_sites': 'getBlogSites',
  'get_blog_authors': 'getBlogAuthors',
  'get_blog_categories': 'getBlogCategories',
  'check_url_slug': 'checkUrlSlug',

  // Opportunity Management (10 tools)
  'search_opportunities': 'searchOpportunities',
  'get_pipelines': 'getPipelines',
  'create_opportunity': 'createOpportunity',
  'get_opportunity': 'getOpportunity',
  'update_opportunity': 'updateOpportunity',
  'delete_opportunity': 'deleteOpportunity',
  'update_opportunity_status': 'updateOpportunityStatus',
  'upsert_opportunity': 'upsertOpportunity',
  'add_opportunity_followers': 'addOpportunityFollowers',
  'remove_opportunity_followers': 'removeOpportunityFollowers',

  // Calendar & Appointments (14 tools)
  'get_calendar_groups': 'getCalendarGroups',
  'get_calendars': 'getCalendars',
  'create_calendar': 'createCalendar',
  'update_calendar': 'updateCalendar',
  'delete_calendar': 'deleteCalendar',
  'get_calendar_events': 'getCalendarEvents',
  'get_free_slots': 'getFreeSlots',
  'create_appointment': 'createAppointment',
  'get_appointment': 'getAppointment',
  'update_appointment': 'updateAppointment',
  'delete_appointment': 'deleteAppointment',
  'create_block_slot': 'createBlockSlot',
  'update_block_slot': 'updateBlockSlot',
  'delete_block_slot': 'deleteBlockSlot',

  // Email Marketing (5 tools)
  'get_email_campaigns': 'getEmailCampaigns',
  'create_email_template': 'createEmailTemplate',
  'get_email_templates': 'getEmailTemplates',
  'update_email_template': 'updateEmailTemplate',
  'delete_email_template': 'deleteEmailTemplate',

  // Location Management (24 tools)
  'search_locations': 'searchLocations',
  'get_location': 'getLocation',
  'create_location': 'createLocation',
  'update_location': 'updateLocation',
  'delete_location': 'deleteLocation',
  'get_location_tags': 'getLocationTags',
  'create_location_tag': 'createLocationTag',
  'update_location_tag': 'updateLocationTag',
  'delete_location_tag': 'deleteLocationTag',
  'get_location_custom_fields': 'getLocationCustomFields',
  'create_location_custom_field': 'createLocationCustomField',
  'update_location_custom_field': 'updateLocationCustomField',
  'delete_location_custom_field': 'deleteLocationCustomField',
  'get_location_custom_values': 'getLocationCustomValues',
  'create_location_custom_value': 'createLocationCustomValue',
  'update_location_custom_value': 'updateLocationCustomValue',
  'delete_location_custom_value': 'deleteLocationCustomValue',
  'get_location_templates': 'getLocationTemplates',
  'delete_location_template': 'deleteLocationTemplate',
  'get_timezones': 'getTimezones',
  'get_location_snippets': 'getLocationSnippets',
  'create_location_snippet': 'createLocationSnippet',
  'update_location_snippet': 'updateLocationSnippet',
  'delete_location_snippet': 'deleteLocationSnippet',

  // Email Verification (1 tool)
  'verify_email': 'verifyEmail',

  // Social Media Management (17 tools)
  'search_social_posts': 'searchSocialPosts',
  'create_social_post': 'createSocialPost',
  'get_social_post': 'getSocialPost',
  'update_social_post': 'updateSocialPost',
  'delete_social_post': 'deleteSocialPost',
  'bulk_delete_social_posts': 'bulkDeleteSocialPosts',
  'get_social_accounts': 'getSocialAccounts',
  'delete_social_account': 'deleteSocialAccount',
  'start_social_oauth': 'startSocialOAuth',
  'upload_social_csv': 'uploadSocialCSV',
  'get_csv_upload_status': 'getCSVUploadStatus',
  'set_csv_accounts': 'setCSVAccounts',
  'get_social_categories': 'getSocialCategories',
  'get_social_tags': 'getSocialTags',
  'get_social_tags_by_ids': 'getSocialTagsByIds',
  'review_social_post': 'reviewSocialPost',
  'update_review_status': 'updateReviewStatus',

  // Media Library (3 tools)
  'get_media_files': 'getMediaFiles',
  'upload_media_file': 'uploadMediaFile',
  'delete_media_file': 'deleteMediaFile',

  // Custom Objects (9 tools)
  'get_all_objects': 'getAllObjects',
  'create_object_schema': 'createObjectSchema',
  'get_object_schema': 'getObjectSchema',
  'update_object_schema': 'updateObjectSchema',
  'create_object_record': 'createObjectRecord',
  'get_object_record': 'getObjectRecord',
  'update_object_record': 'updateObjectRecord',
  'delete_object_record': 'deleteObjectRecord',
  'search_object_records': 'searchObjectRecords',

  // Association Management (10 tools)
  'ghl_get_all_associations': 'getAllAssociations',
  'ghl_create_association': 'createAssociation',
  'ghl_get_association_by_id': 'getAssociationById',
  'ghl_update_association': 'updateAssociation',
  'ghl_delete_association': 'deleteAssociation',
  'ghl_create_relation': 'createRelation',
  'ghl_get_relations_by_record': 'getRelationsByRecord',
  'ghl_delete_relation': 'deleteRelation',
  'ghl_get_association_types': 'getAssociationTypes',
  'ghl_bulk_create_relations': 'bulkCreateRelations',

  // Custom Fields V2 (8 tools)
  'ghl_get_custom_field_by_id': 'getCustomFieldById',
  'ghl_create_custom_field': 'createCustomField',
  'ghl_update_custom_field': 'updateCustomField',
  'ghl_delete_custom_field': 'deleteCustomField',
  'ghl_get_custom_fields_by_object_key': 'getCustomFieldsByObjectKey',
  'ghl_create_custom_field_folder': 'createCustomFieldFolder',
  'ghl_update_custom_field_folder': 'updateCustomFieldFolder',
  'ghl_delete_custom_field_folder': 'deleteCustomFieldFolder',

  // Workflow Management (1 tool)
  'ghl_get_workflows': 'getWorkflows',

  // Survey Management (2 tools)
  'ghl_get_surveys': 'getSurveys',
  'ghl_get_survey_submissions': 'getSurveySubmissions',

  // Store Management (18 tools)
  'ghl_create_shipping_zone': 'createShippingZone',
  'ghl_list_shipping_zones': 'listShippingZones',
  'ghl_get_shipping_zone': 'getShippingZone',
  'ghl_update_shipping_zone': 'updateShippingZone',
  'ghl_delete_shipping_zone': 'deleteShippingZone',
  'ghl_get_available_shipping_rates': 'getAvailableShippingRates',
  'ghl_create_shipping_rate': 'createShippingRate',
  'ghl_list_shipping_rates': 'listShippingRates',
  'ghl_get_shipping_rate': 'getShippingRate',
  'ghl_update_shipping_rate': 'updateShippingRate',
  'ghl_delete_shipping_rate': 'deleteShippingRate',
  'ghl_create_shipping_carrier': 'createShippingCarrier',
  'ghl_list_shipping_carriers': 'listShippingCarriers',
  'ghl_update_shipping_carrier': 'updateShippingCarrier',
  'ghl_delete_shipping_carrier': 'deleteShippingCarrier',
  'ghl_create_store_setting': 'createStoreSetting',
  'ghl_get_store_setting': 'getStoreSetting',
  'ghl_update_store_setting': 'updateStoreSetting',

  // Products Management (10 tools)
  'ghl_create_product': 'createProduct',
  'ghl_list_products': 'listProducts',
  'ghl_get_product': 'getProduct',
  'ghl_update_product': 'updateProduct',
  'ghl_delete_product': 'deleteProduct',
  'ghl_create_price': 'createPrice',
  'ghl_list_prices': 'listPrices',
  'ghl_list_inventory': 'listInventory',
  'ghl_create_product_collection': 'createProductCollection',
  'ghl_list_product_collections': 'listProductCollections',

  // Payments Management (20 tools)
  'create_whitelabel_integration_provider': 'createWhitelabelIntegrationProvider',
  'list_whitelabel_integration_providers': 'listWhitelabelIntegrationProviders',
  'list_orders': 'listOrders',
  'get_order_by_id': 'getOrderById',
  'create_order_fulfillment': 'createOrderFulfillment',
  'list_order_fulfillments': 'listOrderFulfillments',
  'list_transactions': 'listTransactions',
  'get_transaction_by_id': 'getTransactionById',
  'list_subscriptions': 'listSubscriptions',
  'get_subscription_by_id': 'getSubscriptionById',
  'list_coupons': 'listCoupons',
  'create_coupon': 'createCoupon',
  'update_coupon': 'updateCoupon',
  'delete_coupon': 'deleteCoupon',
  'get_coupon': 'getCoupon',
  'create_custom_provider_integration': 'createCustomProviderIntegration',
  'delete_custom_provider_integration': 'deleteCustomProviderIntegration',
  'get_custom_provider_config': 'getCustomProviderConfig',
  'create_custom_provider_config': 'createCustomProviderConfig',
  'update_custom_provider_config': 'updateCustomProviderConfig',

  // Invoices & Billing (39 tools)
  'create_invoice_template': 'createInvoiceTemplate',
  'list_invoice_templates': 'listInvoiceTemplates',
  'get_invoice_template': 'getInvoiceTemplate',
  'update_invoice_template': 'updateInvoiceTemplate',
  'delete_invoice_template': 'deleteInvoiceTemplate',
  'update_invoice_template_late_fees': 'updateInvoiceTemplateLateFees',
  'update_invoice_template_payment_methods': 'updateInvoiceTemplatePaymentMethods',
  'create_invoice_schedule': 'createInvoiceSchedule',
  'list_invoice_schedules': 'listInvoiceSchedules',
  'get_invoice_schedule': 'getInvoiceSchedule',
  'update_invoice_schedule': 'updateInvoiceSchedule',
  'delete_invoice_schedule': 'deleteInvoiceSchedule',
  'schedule_invoice_schedule': 'scheduleInvoiceSchedule',
  'auto_payment_invoice_schedule': 'autoPaymentInvoiceSchedule',
  'cancel_invoice_schedule': 'cancelInvoiceSchedule',
  'create_invoice': 'createInvoice',
  'list_invoices': 'listInvoices',
  'get_invoice': 'getInvoice',
  'update_invoice': 'updateInvoice',
  'delete_invoice': 'deleteInvoice',
  'void_invoice': 'voidInvoice',
  'send_invoice': 'sendInvoice',
  'record_invoice_payment': 'recordInvoicePayment',
  'generate_invoice_number': 'generateInvoiceNumber',
  'text2pay_invoice': 'text2payInvoice',
  'create_estimate': 'createEstimate',
  'list_estimates': 'listEstimates',
  'get_estimate': 'getEstimate',
  'update_estimate': 'updateEstimate',
  'delete_estimate': 'deleteEstimate',
  'send_estimate': 'sendEstimate',
  'create_invoice_from_estimate': 'createInvoiceFromEstimate',
  'generate_estimate_number': 'generateEstimateNumber',
  'list_estimate_templates': 'listEstimateTemplates',
  'create_estimate_template': 'createEstimateTemplate',
  'get_estimate_template': 'getEstimateTemplate',
  'update_estimate_template': 'updateEstimateTemplate',
  'delete_estimate_template': 'deleteEstimateTemplate',
  'preview_estimate_template': 'previewEstimateTemplate',

  // Forms & Surveys (18 tools)
  'get_forms': 'getForms',
  'create_form': 'createForm',
  'update_form': 'updateForm',
  'delete_form': 'deleteForm',
  'get_form_submissions': 'getFormSubmissions',
  'create_form_submission': 'createFormSubmission',
  'update_form_submission': 'updateFormSubmission',
  'delete_form_submission': 'deleteFormSubmission',
  'get_surveys': 'getSurveys',
  'create_survey': 'createSurvey',
  'update_survey': 'updateSurvey',
  'delete_survey': 'deleteSurvey',
  'get_survey_submissions': 'getSurveySubmissions',
  'create_survey_submission': 'createSurveySubmission',
  'update_survey_submission': 'updateSurveySubmission',
  'delete_survey_submission': 'deleteSurveySubmission',
  'get_form_fields': 'getFormFields',
  'get_survey_fields': 'getSurveyFields',

  // User Management (15 tools)
  'get_users': 'getUsers',
  'get_user': 'getUser',
  'create_user': 'createUser',
  'update_user': 'updateUser',
  'delete_user': 'deleteUser',
  'get_user_by_email': 'getUserByEmail',
  'get_user_permissions': 'getUserPermissions',
  'update_user_permissions': 'updateUserPermissions',
  'get_user_roles': 'getUserRoles',
  'assign_user_role': 'assignUserRole',
  'remove_user_role': 'removeUserRole',
  'get_teams': 'getTeams',
  'create_team': 'createTeam',
  'update_team': 'updateTeam',
  'delete_team': 'deleteTeam',

  // Campaigns (25 tools)
  'get_campaigns': 'getCampaigns',
  'create_campaign': 'createCampaign',
  'update_campaign': 'updateCampaign',
  'delete_campaign': 'deleteCampaign',
  'get_campaign_contacts': 'getCampaignContacts',
  'add_contact_to_campaign': 'addContactToCampaign',
  'remove_contact_from_campaign': 'removeContactFromCampaign',
  'get_campaign_stats': 'getCampaignStats',
  'pause_campaign': 'pauseCampaign',
  'resume_campaign': 'resumeCampaign',
  'duplicate_campaign': 'duplicateCampaign',
  'get_campaign_opens': 'getCampaignOpens',
  'get_campaign_clicks': 'getCampaignClicks',
  'get_campaign_unsubscribes': 'getCampaignUnsubscribes',
  'get_campaign_bounces': 'getCampaignBounces',
  'test_campaign': 'testCampaign',
  'schedule_campaign': 'scheduleCampaign',
  'unschedule_campaign': 'unscheduleCampaign',
  'get_campaign_ab_tests': 'getCampaignABTests',
  'create_campaign_ab_test': 'createCampaignABTest',
  'update_campaign_ab_test': 'updateCampaignABTest',
  'delete_campaign_ab_test': 'deleteCampaignABTest',
  'get_campaign_segments': 'getCampaignSegments',
  'create_campaign_segment': 'createCampaignSegment',
  'update_campaign_segment': 'updateCampaignSegment',

  // Memberships & Courses (22 tools)
  'get_memberships': 'getMemberships',
  'create_membership': 'createMembership',
  'update_membership': 'updateMembership',
  'delete_membership': 'deleteMembership',
  'get_membership_levels': 'getMembershipLevels',
  'create_membership_level': 'createMembershipLevel',
  'update_membership_level': 'updateMembershipLevel',
  'delete_membership_level': 'deleteMembershipLevel',
  'get_courses': 'getCourses',
  'create_course': 'createCourse',
  'update_course': 'updateCourse',
  'delete_course': 'deleteCourse',
  'get_course_modules': 'getCourseModules',
  'create_course_module': 'createCourseModule',
  'update_course_module': 'updateCourseModule',
  'delete_course_module': 'deleteCourseModule',
  'get_course_enrollments': 'getCourseEnrollments',
  'enroll_in_course': 'enrollInCourse',
  'unenroll_from_course': 'unenrollFromCourse',
  'get_course_progress': 'getCourseProgress',
  'update_course_progress': 'updateCourseProgress',
  'issue_certificate': 'issueCertificate',

  // Triggers & Webhooks (20 tools)
  'get_triggers': 'getTriggers',
  'create_trigger': 'createTrigger',
  'update_trigger': 'updateTrigger',
  'delete_trigger': 'deleteTrigger',
  'test_trigger': 'testTrigger',
  'get_webhooks': 'getWebhooks',
  'create_webhook': 'createWebhook',
  'update_webhook': 'updateWebhook',
  'delete_webhook': 'deleteWebhook',
  'test_webhook': 'testWebhook',
  'get_webhook_events': 'getWebhookEvents',
  'replay_webhook_event': 'replayWebhookEvent',
  'get_trigger_logs': 'getTriggerLogs',
  'get_webhook_logs': 'getWebhookLogs',
  'create_custom_action': 'createCustomAction',
  'update_custom_action': 'updateCustomAction',
  'delete_custom_action': 'deleteCustomAction',
  'test_custom_action': 'testCustomAction',
  'get_action_templates': 'getActionTemplates',
  'create_action_template': 'createActionTemplate',

  // Links & URL Shorteners (5 tools)
  'create_short_link': 'createShortLink',
  'get_short_links': 'getShortLinks',
  'update_short_link': 'updateShortLink',
  'delete_short_link': 'deleteShortLink',
  'get_link_analytics': 'getLinkAnalytics',

  // Templates (8 tools - email templates are in Email Marketing section)
  'get_sms_templates': 'getSMSTemplates',
  'create_sms_template': 'createSMSTemplate',
  'update_sms_template': 'updateSMSTemplate',
  'delete_sms_template': 'deleteSMSTemplate',
  'get_funnel_templates': 'getFunnelTemplates',
  'get_website_templates': 'getWebsiteTemplates',
  'duplicate_template': 'duplicateTemplate',
  'preview_template': 'previewTemplate',

  // Funnels & Pages (25 tools)
  'get_funnels': 'getFunnels',
  'create_funnel': 'createFunnel',
  'update_funnel': 'updateFunnel',
  'delete_funnel': 'deleteFunnel',
  'duplicate_funnel': 'duplicateFunnel',
  'get_funnel_pages': 'getFunnelPages',
  'create_funnel_page': 'createFunnelPage',
  'update_funnel_page': 'updateFunnelPage',
  'delete_funnel_page': 'deleteFunnelPage',
  'duplicate_funnel_page': 'duplicateFunnelPage',
  'get_funnel_stats': 'getFunnelStats',
  'get_page_views': 'getPageViews',
  'get_conversion_rates': 'getConversionRates',
  'create_ab_test': 'createABTest',
  'update_ab_test': 'updateABTest',
  'delete_ab_test': 'deleteABTest',
  'get_ab_test_results': 'getABTestResults',
  'publish_funnel': 'publishFunnel',
  'unpublish_funnel': 'unpublishFunnel',
  'get_funnel_domains': 'getFunnelDomains',
  'add_funnel_domain': 'addFunnelDomain',
  'remove_funnel_domain': 'removeFunnelDomain',
  'get_funnel_integrations': 'getFunnelIntegrations',
  'add_funnel_integration': 'addFunnelIntegration',
  'remove_funnel_integration': 'removeFunnelIntegration',

  // Sites & Websites (20 tools)
  'get_websites': 'getWebsites',
  'create_website': 'createWebsite',
  'update_website': 'updateWebsite',
  'delete_website': 'deleteWebsite',
  'duplicate_website': 'duplicateWebsite',
  'get_website_pages': 'getWebsitePages',
  'create_website_page': 'createWebsitePage',
  'update_website_page': 'updateWebsitePage',
  'delete_website_page': 'deleteWebsitePage',
  'duplicate_website_page': 'duplicateWebsitePage',
  'publish_website': 'publishWebsite',
  'unpublish_website': 'unpublishWebsite',
  'get_website_domains': 'getWebsiteDomains',
  'add_website_domain': 'addWebsiteDomain',
  'remove_website_domain': 'removeWebsiteDomain',
  'get_website_analytics': 'getWebsiteAnalytics',
  'get_website_seo': 'getWebsiteSEO',
  'update_website_seo': 'updateWebsiteSEO',
  'get_website_forms': 'getWebsiteForms',
  'get_website_chat_widget': 'getWebsiteChatWidget',

  // Reviews & Reputation (10 tools)
  'get_reviews': 'getReviews',
  'request_review': 'requestReview',
  'respond_to_review': 'respondToReview',
  'get_review_stats': 'getReviewStats',
  'get_review_templates': 'getReviewTemplates',
  'create_review_template': 'createReviewTemplate',
  'update_review_template': 'updateReviewTemplate',
  'delete_review_template': 'deleteReviewTemplate',
  'get_review_campaigns': 'getReviewCampaigns',
  'create_review_campaign': 'createReviewCampaign',

  // Reporting & Analytics (9 tools)
  'get_reporting_data': 'getReportingData',
  'get_analytics_summary': 'getAnalyticsSummary',
  'get_revenue_report': 'getRevenueReport',
  'get_conversion_report': 'getConversionReport',
  'get_attribution_report': 'getAttributionReport',
  'get_engagement_report': 'getEngagementReport',
  'create_custom_report': 'createCustomReport',
  'schedule_report': 'scheduleReport',
  'export_report': 'exportReport',

  // Special RL Integration endpoints (2 tools)
  'get_conversation_transcripts': 'getConversationTranscripts',
  'get_contact_journey': 'getContactJourney',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tool: string[] } }
) {
  return handleMCPRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tool: string[] } }
) {
  return handleMCPRequest(request, params, 'POST')
}

async function handleMCPRequest(
  request: NextRequest,
  params: { tool: string[] },
  method: 'GET' | 'POST'
) {
  const startTime = Date.now()
  
  try {
    // Extract tool name from URL
    const toolPath = params.tool
    if (!toolPath || toolPath.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tool name required' 
        },
        { status: 400 }
      )
    }

    const toolName = toolPath[0]
    
    // Check if tool is supported
    if (!MCP_TOOLS[toolName as keyof typeof MCP_TOOLS]) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Tool '${toolName}' not supported`,
          availableTools: Object.keys(MCP_TOOLS)
        },
        { status: 400 }
      )
    }

    // Log request headers for debugging
    console.log('MCP Request:', {
      tool: toolName,
      headers: {
        'X-Tenant-API-Key': request.headers.get('X-Tenant-API-Key') ? '[present]' : '[missing]',
        'Authorization': request.headers.get('Authorization') ? '[present]' : '[missing]'
      }
    })

    // Authenticate tenant
    const authResult = await tenantAuth.authenticateRequest(request)
    if (!authResult.success) {
      console.error('Authentication failed:', {
        error: authResult.error,
        statusCode: authResult.statusCode
      })
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error 
        },
        { status: authResult.statusCode || 401 }
      )
    }

    const { tenant, tenantConfig } = authResult
    if (!tenant || !tenantConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tenant configuration not found' 
        },
        { status: 404 }
      )
    }

    // Create tenant-specific GHL client
    // tenantConfig already has the decrypted GHL API key
    const tenantData = {
      id: tenantConfig.id,
      name: tenantConfig.name,
      subdomain: tenantConfig.name.toLowerCase().replace(/\s+/g, '-'),
      api_key_hash: '',
      encrypted_ghl_api_key: '',
      ghl_location_id: tenantConfig.ghlLocationId,
      settings: {},
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      subscription_tier: tenantConfig.plan as 'free' | 'pro' | 'enterprise',
      usage_limit: 1000,
      current_usage: 0
    }
    const ghlClient = createTenantGHLClientFixed(tenantData, tenantConfig.ghlApiKey)
    if (!ghlClient) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create GHL client for tenant' 
        },
        { status: 500 }
      )
    }

    // Parse request body for POST requests
    let requestData: Record<string, any> = {}
    if (method === 'POST') {
      try {
        requestData = await request.json()
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid JSON in request body' 
          },
          { status: 400 }
        )
      }
    } else {
      // Parse query parameters for GET requests
      const url = new URL(request.url)
      url.searchParams.forEach((value, key) => {
        requestData[key] = value
      })
    }

    // Execute the tool
    const methodName = MCP_TOOLS[toolName as keyof typeof MCP_TOOLS]
    
    if (!methodName) {
      throw new Error(`Unknown MCP tool: ${toolName}`)
    }
    
    // Get the method from the GHL client
    const clientMethod = (ghlClient as any)[methodName]
    
    if (typeof clientMethod !== 'function') {
      throw new Error(`Method ${methodName} not found on GHL client`)
    }
    
    // Call the method with appropriate parameters based on the tool
    let result
    
    // Handle methods that expect specific parameter structures
    // Most methods now just take the full requestData object
    try {
      result = await clientMethod.call(ghlClient, requestData)
    } catch (error) {
      // If the method fails, try with specific parameter extraction for backward compatibility
      const toolName = params.tool[0]
      
      // Handle special cases that need parameter extraction
      if (toolName === 'get_contact' || toolName === 'update_contact' || toolName === 'delete_contact') {
        result = await clientMethod.call(ghlClient, requestData.contactId, requestData)
      } else if (toolName === 'add_contact_tags' || toolName === 'remove_contact_tags') {
        result = await clientMethod.call(ghlClient, requestData.contactId, requestData.tags || [])
      } else if (toolName === 'send_sms' || toolName === 'send_email') {
        result = await clientMethod.call(ghlClient, requestData)
      } else if (toolName === 'get_opportunity' || toolName === 'update_opportunity' || toolName === 'delete_opportunity') {
        result = await clientMethod.call(ghlClient, requestData.opportunityId, requestData)
      } else if (toolName === 'update_opportunity_status') {
        result = await clientMethod.call(ghlClient, requestData.opportunityId, requestData.status)
      } else if (toolName === 'get_appointment' || toolName === 'update_appointment' || toolName === 'delete_appointment') {
        result = await clientMethod.call(ghlClient, requestData.appointmentId, requestData)
      } else if (toolName.includes('contact_task')) {
        result = await clientMethod.call(ghlClient, requestData.contactId, requestData.taskId, requestData)
      } else if (toolName.includes('contact_note')) {
        result = await clientMethod.call(ghlClient, requestData.contactId, requestData.noteId, requestData)
      } else if (toolName === 'add_contact_to_workflow' || toolName === 'remove_contact_from_workflow') {
        result = await clientMethod.call(ghlClient, requestData.contactId, requestData.workflowId, requestData)
      } else if (toolName === 'get_invoice' || toolName === 'update_invoice' || toolName === 'delete_invoice') {
        result = await clientMethod.call(ghlClient, requestData.invoiceId, requestData)
      } else if (toolName === 'get_estimate' || toolName === 'update_estimate' || toolName === 'delete_estimate') {
        result = await clientMethod.call(ghlClient, requestData.estimateId, requestData)
      } else {
        // Re-throw the original error if no special handling applies
        throw error
      }
    }

    const responseTime = Date.now() - startTime

    // Record successful usage
    await tenantAuth.recordUsage(
      tenant.tenantId,
      `mcp/${toolName}`,
      method,
      responseTime,
      200,
      calculateTokensCost(toolName, result),
      {
        toolName,
        requestSize: JSON.stringify(requestData).length,
        responseSize: JSON.stringify(result).length
      }
    )

    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        tool: toolName,
        tenantId: tenant.tenantId,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error('MCP API error:', error)

    // Record error usage if we have tenant info
    if (params?.tool?.[0]) {
      try {
        const apiKey = request.headers.get('X-Tenant-API-Key') || 
                      request.headers.get('Authorization')?.replace('Bearer ', '')
        if (apiKey) {
          const tenant = await tenantAuth.authenticateTenant(apiKey)
          if (tenant) {
            await tenantAuth.recordUsage(
              tenant.tenantId,
              `mcp/${params.tool[0]}`,
              method,
              responseTime,
              500,
              0,
              {
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            )
          }
        }
      } catch (recordError) {
        console.error('Error recording usage:', recordError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        metadata: {
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`
        }
      },
      { status: 500 }
    )
  }
}

/**
 * Calculate tokens cost based on tool usage
 */
function calculateTokensCost(toolName: string, result: unknown): number {
  // Simple cost calculation - can be made more sophisticated
  const baseCost = 0.001 // Base cost per API call
  const dataCost = JSON.stringify(result).length * 0.000001 // Cost per byte of response
  
  // Tool-specific multipliers
  const toolMultipliers: Record<string, number> = {
    'send_sms': 2.0,
    'send_email': 1.5,
    'create_contact': 1.2,
    'create_opportunity': 1.2,
    'get_conversation_transcripts': 3.0, // More expensive for RL integration
    'get_contact_journey': 2.5,
  }

  const multiplier = toolMultipliers[toolName] || 1.0
  return (baseCost + dataCost) * multiplier
}

/**
 * List all available MCP tools endpoint
 */
export async function OPTIONS(request: NextRequest) {
  try {
    // Authenticate tenant for tool listing
    const authResult = await tenantAuth.authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: authResult.error 
        },
        { status: authResult.statusCode || 401 }
      )
    }

    const tools = Object.keys(MCP_TOOLS).map(toolName => ({
      name: toolName,
      description: getToolDescription(toolName),
      category: getToolCategory(toolName),
      parameters: getToolParameters(toolName)
    }))

    return NextResponse.json({
      success: true,
      data: {
        tools,
        totalTools: tools.length,
        categories: [...new Set(tools.map(t => t.category))]
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })

  } catch (error) {
    console.error('Error listing MCP tools:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list tools'
      },
      { status: 500 }
    )
  }
}

function getToolDescription(toolName: string): string {
  const descriptions: Record<string, string> = {
    'search_contacts': 'Search and filter contacts in GHL',
    'get_contact': 'Get detailed contact information',
    'create_contact': 'Create a new contact',
    'update_contact': 'Update existing contact information',
    'delete_contact': 'Delete a contact',
    'send_sms': 'Send SMS message to contact',
    'send_email': 'Send email to contact',
    'search_opportunities': 'Search opportunities in pipelines',
    'create_opportunity': 'Create new sales opportunity',
    'get_conversation_transcripts': 'Get formatted conversation transcripts for RL analysis',
    'get_contact_journey': 'Get complete contact journey timeline'
  }
  
  return descriptions[toolName] || 'GHL API operation'
}

function getToolCategory(toolName: string): string {
  // Contact Management
  if (toolName.includes('contact') && !toolName.includes('campaign')) return 'Contact Management'
  
  // Messaging & Conversations
  if (toolName.includes('conversation') || toolName.includes('message') || 
      toolName === 'send_sms' || toolName === 'send_email' || 
      toolName.includes('whatsapp') || toolName.includes('facebook') || 
      toolName.includes('instagram') || toolName === 'live_chat_typing') return 'Messaging & Conversations'
  
  // Blog Management
  if (toolName.includes('blog') || toolName === 'check_url_slug') return 'Blog Management'
  
  // Opportunity Management
  if (toolName.includes('opportunity') || toolName.includes('pipeline')) return 'Opportunity Management'
  
  // Calendar & Appointments
  if (toolName.includes('calendar') || toolName.includes('appointment') || 
      toolName.includes('slot') || toolName === 'get_free_slots') return 'Calendar & Appointments'
  
  // Email Marketing
  if (toolName.includes('email_campaign') || toolName.includes('email_template')) return 'Email Marketing'
  
  // Location Management
  if (toolName.includes('location') || toolName === 'get_timezones') return 'Location Management'
  
  // Email Verification
  if (toolName === 'verify_email') return 'Email Verification'
  
  // Social Media Management
  if (toolName.includes('social') || toolName.includes('csv')) return 'Social Media Management'
  
  // Media Library
  if (toolName.includes('media_file')) return 'Media Library'
  
  // Custom Objects
  if (toolName.includes('object') && !toolName.includes('association')) return 'Custom Objects'
  
  // Association Management
  if (toolName.includes('association') || toolName.includes('relation')) return 'Association Management'
  
  // Custom Fields V2
  if (toolName.includes('custom_field') && toolName.startsWith('ghl_')) return 'Custom Fields V2'
  
  // Workflow Management
  if (toolName.includes('workflow') || toolName === 'ghl_get_workflows') return 'Workflow Management'
  
  // Survey Management
  if (toolName.includes('survey') && toolName.startsWith('ghl_')) return 'Survey Management'
  
  // Store Management
  if (toolName.includes('shipping') || toolName.includes('store_setting')) return 'Store Management'
  
  // Products Management
  if (toolName.includes('product') || toolName.includes('price') || 
      toolName.includes('inventory') || toolName.includes('collection')) return 'Products Management'
  
  // Payments Management
  if (toolName.includes('payment') || toolName.includes('order') || 
      toolName.includes('transaction') || toolName.includes('subscription') || 
      toolName.includes('coupon') || toolName.includes('provider')) return 'Payments Management'
  
  // Invoices & Billing
  if (toolName.includes('invoice') || toolName.includes('estimate') || 
      toolName.includes('text2pay')) return 'Invoices & Billing'
  
  // Forms & Surveys
  if (toolName.includes('form') || (toolName.includes('survey') && !toolName.startsWith('ghl_'))) return 'Forms & Surveys'
  
  // User Management
  if (toolName.includes('user') || toolName.includes('team') || 
      toolName.includes('permission') || toolName.includes('role')) return 'User Management'
  
  // Campaigns
  if (toolName.includes('campaign')) return 'Campaigns'
  
  // Memberships & Courses
  if (toolName.includes('membership') || toolName.includes('course') || 
      toolName.includes('module') || toolName.includes('enrollment') || 
      toolName.includes('certificate')) return 'Memberships & Courses'
  
  // Triggers & Webhooks
  if (toolName.includes('trigger') || toolName.includes('webhook') || 
      toolName.includes('action')) return 'Triggers & Webhooks'
  
  // Links & URL Shorteners
  if (toolName.includes('short_link') || toolName.includes('link_analytics')) return 'Links & URL Shorteners'
  
  // Templates
  if (toolName.includes('template') && !toolName.includes('invoice') && 
      !toolName.includes('estimate')) return 'Templates'
  
  // Funnels & Pages
  if (toolName.includes('funnel') || toolName.includes('ab_test') || 
      toolName.includes('page_view') || toolName.includes('conversion_rate')) return 'Funnels & Pages'
  
  // Sites & Websites
  if (toolName.includes('website') || toolName.includes('seo') || 
      toolName.includes('chat_widget')) return 'Sites & Websites'
  
  // Reviews & Reputation
  if (toolName.includes('review')) return 'Reviews & Reputation'
  
  // Reporting & Analytics
  if (toolName.includes('report') || toolName.includes('analytics')) return 'Reporting & Analytics'
  
  // RL Integration
  if (toolName.includes('transcripts') || toolName.includes('journey')) return 'RL Integration'
  
  return 'General'
}

function getToolParameters(toolName: string): Record<string, string> {
  // Define expected parameters for each tool
  const parameters: Record<string, Record<string, string>> = {
    'get_contact': { contactId: 'string (required)' },
    'create_contact': { firstName: 'string', lastName: 'string', email: 'string', phone: 'string' },
    'send_sms': { contactId: 'string (required)', message: 'string (required)' },
    'send_email': { contactId: 'string (required)', subject: 'string (required)', body: 'string (required)' },
    'search_contacts': { query: 'string', tags: 'array', limit: 'number' },
    'get_conversation_transcripts': { contactId: 'string', startDate: 'string', endDate: 