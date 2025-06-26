/**
 * Tenant-Aware GoHighLevel Client
 * Extends the existing GHL MCP server with multi-tenant capabilities
 */

import { GHLConfig, GHLContact, GHLConversation, GHLOpportunity } from '@/types'
import { tenantAuth } from '@/lib/auth/tenant-auth'

export class TenantGHLClient {
  private config: GHLConfig
  private tenantId: string

  constructor(tenantId: string, config: GHLConfig) {
    this.tenantId = tenantId
    this.config = config
  }

  /**
   * Create a GHL client instance for a specific tenant
   */
  static async createForTenant(tenantId: string): Promise<TenantGHLClient | null> {
    try {
      const tenantConfig = await tenantAuth.getTenantConfig(tenantId)
      if (!tenantConfig) {
        return null
      }

      const ghlConfig: GHLConfig = {
        accessToken: tenantConfig.ghlApiKey,
        baseUrl: process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com',
        version: '2021-07-28',
        locationId: tenantConfig.ghlLocationId
      }

      return new TenantGHLClient(tenantId, ghlConfig)
    } catch (error) {
      console.error('Error creating tenant GHL client:', error)
      return null
    }
  }

  /**
   * Make authenticated request to GHL API
   */
  private async makeGHLRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any
  ): Promise<any> {
    const url = `${this.config.baseUrl}/${endpoint}`
    const startTime = Date.now()

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          'Version': this.config.version,
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      const responseTime = Date.now() - startTime

      // Record usage for this tenant
      await tenantAuth.recordUsage(
        this.tenantId,
        endpoint,
        method,
        responseTime,
        response.status,
        undefined,
        { ghlEndpoint: endpoint }
      )

      if (!response.ok) {
        throw new Error(`GHL API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      // Record error usage
      await tenantAuth.recordUsage(
        this.tenantId,
        endpoint,
        method,
        responseTime,
        500,
        undefined,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )

      throw error
    }
  }

  /**
   * Delegate to existing GHL MCP tools with tenant context
   */
  async delegateToMCPTool(toolName: string, args: Record<string, any>): Promise<any> {
    try {
      // Add tenant context to args
      const enhancedArgs = {
        ...args,
        locationId: this.config.locationId,
        tenantId: this.tenantId
      }

      // Call the existing GHL MCP server
      const mcpServerUrl = process.env.GHL_MCP_SERVER_URL || 'http://localhost:8000'
      const startTime = Date.now()

      const response = await fetch(`${mcpServerUrl}/api/mcp/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.accessToken}`,
          'X-Tenant-ID': this.tenantId,
        },
        body: JSON.stringify(enhancedArgs),
      })

      const responseTime = Date.now() - startTime

      // Record MCP usage
      await tenantAuth.recordUsage(
        this.tenantId,
        `mcp/${toolName}`,
        'POST',
        responseTime,
        response.status,
        undefined,
        { mcpTool: toolName, args: Object.keys(enhancedArgs) }
      )

      if (!response.ok) {
        throw new Error(`MCP tool error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error calling MCP tool ${toolName}:`, error)
      throw error
    }
  }

  // Contact Management Methods
  async getContacts(params?: Record<string, any>): Promise<GHLContact[]> {
    return this.delegateToMCPTool('search_contacts', params || {})
  }

  async getContact(contactId: string): Promise<GHLContact> {
    return this.delegateToMCPTool('get_contact', { contactId })
  }

  async createContact(contactData: Partial<GHLContact>): Promise<GHLContact> {
    return this.delegateToMCPTool('create_contact', contactData)
  }

  async updateContact(contactId: string, contactData: Partial<GHLContact>): Promise<GHLContact> {
    return this.delegateToMCPTool('update_contact', { contactId, ...contactData })
  }

  async deleteContact(contactId: string): Promise<void> {
    return this.delegateToMCPTool('delete_contact', { contactId })
  }

  // Conversation Management Methods
  async getConversations(contactId?: string): Promise<GHLConversation[]> {
    return this.delegateToMCPTool('search_conversations', { contactId })
  }

  async getConversation(conversationId: string): Promise<GHLConversation> {
    return this.delegateToMCPTool('get_conversation', { conversationId })
  }

  async sendSMS(contactId: string, message: string): Promise<any> {
    return this.delegateToMCPTool('send_sms', { contactId, message })
  }

  async sendEmail(contactId: string, subject: string, body: string): Promise<any> {
    return this.delegateToMCPTool('send_email', { contactId, subject, body })
  }

  // Opportunity Management Methods
  async getOpportunities(params?: Record<string, any>): Promise<GHLOpportunity[]> {
    return this.delegateToMCPTool('search_opportunities', params || {})
  }

  async getOpportunity(opportunityId: string): Promise<GHLOpportunity> {
    return this.delegateToMCPTool('get_opportunity', { opportunityId })
  }

  async createOpportunity(opportunityData: Partial<GHLOpportunity>): Promise<GHLOpportunity> {
    return this.delegateToMCPTool('create_opportunity', opportunityData)
  }

  async updateOpportunity(opportunityId: string, opportunityData: Partial<GHLOpportunity>): Promise<GHLOpportunity> {
    return this.delegateToMCPTool('update_opportunity', { opportunityId, ...opportunityData })
  }

  async updateOpportunityStatus(opportunityId: string, status: string): Promise<GHLOpportunity> {
    return this.delegateToMCPTool('update_opportunity_status', { opportunityId, status })
  }

  // Pipeline Management
  async getPipelines(): Promise<any[]> {
    return this.delegateToMCPTool('get_pipelines', {})
  }

  // Calendar Management Methods
  async getCalendars(): Promise<any[]> {
    return this.delegateToMCPTool('get_calendars', {})
  }

  async createAppointment(appointmentData: Record<string, any>): Promise<any> {
    return this.delegateToMCPTool('create_appointment', appointmentData)
  }

  async getAppointments(params?: Record<string, any>): Promise<any[]> {
    return this.delegateToMCPTool('get_calendar_events', params || {})
  }

  // Workflow Management
  async getWorkflows(): Promise<any[]> {
    return this.delegateToMCPTool('ghl_get_workflows', {})
  }

  async addContactToWorkflow(contactId: string, workflowId: string): Promise<any> {
    return this.delegateToMCPTool('add_contact_to_workflow', { contactId, workflowId })
  }

  // Custom Fields Management
  async getCustomFields(): Promise<any[]> {
    return this.delegateToMCPTool('get_location_custom_fields', {})
  }

  async createCustomField(fieldData: Record<string, any>): Promise<any> {
    return this.delegateToMCPTool('create_location_custom_field', fieldData)
  }

  // Tags Management
  async addContactTags(contactId: string, tags: string[]): Promise<any> {
    return this.delegateToMCPTool('add_contact_tags', { contactId, tags })
  }

  async removeContactTags(contactId: string, tags: string[]): Promise<any> {
    return this.delegateToMCPTool('remove_contact_tags', { contactId, tags })
  }

  // Media Management
  async getMediaFiles(params?: Record<string, any>): Promise<any[]> {
    return this.delegateToMCPTool('get_media_files', params || {})
  }

  async uploadMediaFile(fileData: Record<string, any>): Promise<any> {
    return this.delegateToMCPTool('upload_media_file', fileData)
  }

  // Products and E-commerce
  async getProducts(params?: Record<string, any>): Promise<any[]> {
    return this.delegateToMCPTool('ghl_list_products', params || {})
  }

  async createProduct(productData: Record<string, any>): Promise<any> {
    return this.delegateToMCPTool('ghl_create_product', productData)
  }

  // Special methods for RL integration
  async getConversationTranscripts(params?: {
    contactId?: string
    startDate?: string
    endDate?: string
    includeTypes?: ('sms' | 'email' | 'call')[]
  }): Promise<any[]> {
    try {
      const conversations = await this.getConversations(params?.contactId)
      
      // Filter and format for RL analysis
      return conversations
        .filter(conv => {
          if (params?.includeTypes && !params.includeTypes.includes(conv.type)) {
            return false
          }
          return true
        })
        .map(conv => ({
          conversationId: conv.id,
          contactId: conv.contactId,
          type: conv.type,
          messages: conv.messages?.map(msg => ({
            speaker: msg.type === 'inbound' ? 'customer' : 'sales_rep',
            message: msg.body,
            timestamp: msg.timestamp
          })) || [],
          metadata: {
            tenantId: this.tenantId,
            source: 'ghl'
          }
        }))
    } catch (error) {
      console.error('Error getting conversation transcripts:', error)
      throw error
    }
  }

  /**
   * Get contact journey for RL analysis
   */
  async getContactJourney(contactId: string): Promise<{
    contact: GHLContact
    conversations: any[]
    opportunities: GHLOpportunity[]
    appointments: any[]
    timeline: any[]
  }> {
    try {
      const [contact, conversations, opportunities, appointments] = await Promise.all([
        this.getContact(contactId),
        this.getConversationTranscripts({ contactId }),
        this.getOpportunities({ contactId }),
        this.getAppointments({ contactId })
      ])

      // Create timeline
      const timeline = [
        ...conversations.flatMap(conv => conv.messages.map((msg: any) => ({
          type: 'message',
          timestamp: msg.timestamp,
          data: msg
        }))),
        ...opportunities.map(opp => ({
          type: 'opportunity',
          timestamp: opp.createdAt,
          data: opp
        })),
        ...appointments.map(apt => ({
          type: 'appointment',
          timestamp: apt.startTime,
          data: apt
        }))
      ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

      return {
        contact,
        conversations,
        opportunities,
        appointments,
        timeline
      }
    } catch (error) {
      console.error('Error getting contact journey:', error)
      throw error
    }
  }
}

/**
 * Factory function to create tenant-specific GHL clients
 */
export async function createTenantGHLClient(tenantId: string): Promise<TenantGHLClient | null> {
  return TenantGHLClient.createForTenant(tenantId)
}