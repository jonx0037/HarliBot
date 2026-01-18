# HarliBot Master Project Plan
## AI Chatbot Replacement for City of Harlingen, TX

**Project Lead**: Jonathan Rocha  
**Client**: City of Harlingen, TX - IT Department  
**Primary Contact**: Sergio Mujica, IT Director  
**Deadline**: Monday Morning (Prototype + Proposal)  
**Date Created**: January 2025

---

## Executive Summary

HarliBot is a comprehensive AI chatbot solution designed to replace the City of Harlingen's current non-functional chatbot. This project delivers a modern, bilingual, embedded chatbot that provides accurate information about city services, departments, and resources while maintaining long-term cost efficiency through local deployment.

### Primary Objectives
1. **Immediate**: Deliver working prototype by Monday morning
2. **Short-term**: Provide comprehensive proposal for city manager approval
3. **Long-term**: Implement city-owned, locally-hosted AI solution

### Key Differentiators from Current Solution
- ✅ Embedded widget (stays on main site, doesn't redirect)
- ✅ Properly trained on harlingentx.gov content
- ✅ Professional UI/UX with modern design
- ✅ True bilingual support (English/Spanish)
- ✅ Accurate, contextual responses
- ✅ Path to city-owned infrastructure (no vendor lock-in)

---

## Project Phases

### Phase 1: Weekend Prototype (Jan 17-19, 2025)
**Deliverable**: Working demonstration chatbot + preliminary proposal  
**Timeline**: 48-72 hours  
**Deployment**: GitHub Pages (demo) / Vercel (backup)

### Phase 2: Production Implementation (Post-Approval)
**Deliverable**: Production-ready, city-hosted chatbot  
**Timeline**: 4-6 weeks  
**Deployment**: City-controlled infrastructure with Ollama

---

## Weekend Timeline (Phase 1)

### Friday Evening (Jan 17)
- [x] Initial contact with Sergio Mujica
- [x] Current chatbot assessment
- [ ] **Document Creation** (3-4 hours)
  - [ ] Master Project Plan (this document)
  - [ ] Technical Architecture Document
  - [ ] Knowledge Base Strategy Document
- [ ] GitHub repository setup
- [ ] Project structure initialization

### Saturday (Jan 18)
- [ ] **Morning: Knowledge Base Development** (4-5 hours)
  - [ ] Scrape harlingentx.gov content
  - [ ] Process and structure data
  - [ ] Create document embeddings
  - [ ] Set up vector database (ChromaDB/FAISS)
- [ ] **Afternoon: Core Chatbot Development** (4-5 hours)
  - [ ] Initialize Next.js project
  - [ ] Build chat widget component
  - [ ] Implement temporary AI backend (local solution)
  - [ ] Set up bilingual infrastructure (i18n)
- [ ] **Evening: Integration** (2-3 hours)
  - [ ] Connect knowledge base to chatbot
  - [ ] Implement RAG pipeline
  - [ ] Initial testing

### Sunday (Jan 19)
- [ ] **Morning: Demo Site Development** (4-5 hours)
  - [ ] Replicate harlingentx.gov homepage
  - [ ] Integrate chatbot widget
  - [ ] Responsive design implementation
  - [ ] Bilingual toggle functionality
- [ ] **Afternoon: Polish & Testing** (3-4 hours)
  - [ ] UI/UX refinements
  - [ ] Cross-browser testing
  - [ ] Mobile responsiveness
  - [ ] Performance optimization
  - [ ] Accessibility checks (WCAG compliance)
- [ ] **Evening: Proposal Development** (3-4 hours)
  - [ ] Executive summary
  - [ ] Technical approach documentation
  - [ ] Budget breakdown & cost analysis
  - [ ] ROI calculations
  - [ ] Implementation timeline
  - [ ] Risk assessment

### Monday Morning (Jan 20)
- [ ] **Final Review** (1-2 hours)
  - [ ] Demo site deployment check
  - [ ] Proposal proofreading
  - [ ] Prepare demonstration talking points
- [ ] **Delivery**
  - [ ] Email to Sergio Mujica with links
  - [ ] Demo site URL
  - [ ] Proposal PDF attachment
  - [ ] GitHub repository link

---

## Document Suite

### 1. Master Project Plan ✓ (This Document)
**Purpose**: Overall project organization and timeline  
**Audience**: Internal (Jonathan) / Secondary (Client)  
**Status**: In Progress

### 2. Technical Architecture Document
**Purpose**: System design, component structure, technology decisions  
**Audience**: Technical stakeholders, developers  
**Key Sections**:
- System architecture diagram
- Technology stack with justification
- Component breakdown
- Data flow diagrams
- Temporary vs. production architecture
- Migration strategy from prototype to production

### 3. Knowledge Base Strategy Document
**Purpose**: Content management and RAG implementation  
**Audience**: Technical team, future maintainers  
**Key Sections**:
- Web scraping methodology
- Content processing pipeline
- Data schema/structure
- Embedding generation strategy
- Vector database selection
- Update and maintenance procedures

### 4. UI/UX Specifications Document
**Purpose**: Design guidelines and user experience standards  
**Audience**: Developers, designers, stakeholders  
**Key Sections**:
- Wireframes and mockups
- Component hierarchy
- Interaction patterns
- Bilingual UI implementation
- Accessibility requirements (WCAG 2.1 AA)
- Mobile-first design approach

### 5. Implementation Roadmap
**Purpose**: Detailed project timeline and task breakdown  
**Audience**: Project stakeholders, city manager  
**Key Sections**:
- Phase 1 (Prototype) tasks
- Phase 2 (Production) migration plan
- Milestones and deliverables
- Resource requirements
- Risk assessment and mitigation strategies

### 6. Preliminary Proposal (for City Manager)
**Purpose**: Persuasive business case for HarliBot  
**Audience**: City manager, budget committee, stakeholders  
**Key Sections**:
- Executive summary
- Problem statement (current chatbot failures)
- Proposed solution overview
- Technical approach (non-technical language)
- Budget breakdown
  - Phase 1 costs (prototype/proof of concept)
  - Phase 2 costs (production implementation)
  - Ongoing maintenance costs
- Cost-benefit analysis
- ROI projections (compare to third-party SaaS solutions)
- Implementation timeline
- Success metrics and KPIs
- Risk management
- Next steps and recommendations

---

## Technical Stack

### Phase 1: Prototype (Temporary Solution)
**Frontend**:
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- next-i18next (bilingual support)

**AI/ML (Temporary)**:
- **Option A**: Sentence Transformers (local embeddings)
- **Option B**: Ollama with lightweight model (Llama 3.2 1B/3B)
- **Option C**: Hugging Face Transformers (local inference)
- ChromaDB or FAISS (vector database)
- LangChain (RAG orchestration)

**Deployment**:
- GitHub Pages (primary demo)
- Vercel (backup/production-ready demo)

### Phase 2: Production (Long-term Solution)
**Frontend**: Same as Phase 1

**AI/ML (Production)**:
- Ollama (self-hosted LLM runtime)
- Fine-tuned Llama 3.1 8B or Mistral 7B
- Persistent vector database (PostgreSQL + pgvector or Qdrant)
- Custom RAG pipeline

**Deployment**:
- City-controlled server or cloud instance
- Docker containerization
- CI/CD pipeline via GitHub Actions

---

## Budget Considerations

### Phase 1: Prototype Development
- **Development Time**: 24-30 hours @ $0 (pro bono/portfolio project)
- **Hosting**: $0 (GitHub Pages/Vercel free tier)
- **AI Costs**: $0 (local models)
- **Total**: $0

### Phase 2: Production Implementation (Estimated)

#### One-Time Costs
- **Development & Integration**: 80-120 hours
- **Fine-tuning & Training**: 20-30 hours
- **Testing & QA**: 20-30 hours
- **Documentation & Training**: 10-15 hours
- **Server Setup**: 10-15 hours

#### Recurring Costs (Annual)
- **Hosting**: $500-1,500/year (cloud VPS) OR $0 (city-owned server)
- **Maintenance**: 5-10 hours/month
- **Updates & Improvements**: 10-20 hours/quarter

#### Cost Comparison vs. SaaS Solutions
- Typical enterprise chatbot: $500-2,000/month ($6,000-24,000/year)
- HarliBot (after initial development): $500-1,500/year
- **5-year savings**: $20,000-100,000+

---

## Success Metrics

### Prototype Phase
- ✅ Chatbot responds accurately to city service questions
- ✅ Bilingual functionality works seamlessly
- ✅ Embedded widget doesn't disrupt main site experience
- ✅ Mobile-responsive design
- ✅ Positive feedback from IT Director

### Production Phase
- Reduce citizen service inquiry call volume by 20-30%
- 80%+ chatbot answer accuracy rate
- <2 second average response time
- 90%+ user satisfaction rating
- Zero reliance on third-party AI APIs

---

## Risk Assessment

### High Priority Risks

**Risk**: Knowledge base quality insufficient for accurate responses  
**Mitigation**: Comprehensive content scraping, manual curation of key topics, iterative testing

**Risk**: Temporary AI solution underperforms  
**Mitigation**: Multiple fallback options (Ollama, HF Transformers, rule-based hybrid), extensive testing

**Risk**: Timeline too aggressive for quality delivery  
**Mitigation**: Phased approach, focus on core functionality first, polish incrementally

### Medium Priority Risks

**Risk**: City budget constraints prevent Phase 2 approval  
**Mitigation**: Emphasize long-term cost savings, provide flexible implementation options, demonstrate ROI clearly

**Risk**: Bilingual performance lags in Spanish  
**Mitigation**: Use models with strong multilingual support, test extensively with Spanish content

**Risk**: Deployment complications on GitHub Pages  
**Mitigation**: Vercel backup plan, local development server for demo if needed

---

## Deliverables Checklist

### Monday Morning Deliverables
- [ ] **Live Demo Site**
  - [ ] Accessible URL (GitHub Pages or Vercel)
  - [ ] Working chatbot widget
  - [ ] Bilingual toggle functional
  - [ ] Mobile-responsive
  - [ ] Styled to match harlingentx.gov aesthetic

- [ ] **GitHub Repository**
  - [ ] Clean, documented codebase
  - [ ] README with setup instructions
  - [ ] Architecture documentation
  - [ ] Contribution guidelines

- [ ] **Preliminary Proposal (PDF)**
  - [ ] Executive summary (1 page)
  - [ ] Technical approach (2-3 pages)
  - [ ] Budget breakdown (1-2 pages)
  - [ ] Implementation timeline (1 page)
  - [ ] Cost-benefit analysis (1 page)
  - [ ] Appendices (technical details, references)

- [ ] **Email to Sergio Mujica**
  - [ ] Professional summary
  - [ ] Demo site link
  - [ ] Proposal attachment
  - [ ] GitHub repository link
  - [ ] Request for feedback/next steps

---

## Next Steps After Monday Delivery

### Immediate (Week 1)
1. Gather feedback from Sergio Mujica
2. Present to city manager (if greenlit)
3. Refine proposal based on feedback
4. Establish formal agreement/contract

### Short-term (Weeks 2-4)
1. Begin Phase 2 development if approved
2. Set up city infrastructure requirements
3. Fine-tune production model
4. Conduct stakeholder demos

### Long-term (Months 2-3)
1. Production deployment
2. Staff training
3. Monitoring and optimization
4. Gather user feedback for improvements

---

## Contact Information

**Project Lead**: Jonathan Rocha  
**Client Contact**: Sergio Mujica, IT Director, City of Harlingen  
**Repository**: [To be created]  
**Demo Site**: [To be deployed]

---

## Notes & Decisions Log

### January 17, 2025
- Initial contact with Sergio Mujica established
- Assessed current chatbot: poorly integrated, inaccurate responses, poor UI/UX
- Decision: Pursue local AI solution (Ollama) for long-term to avoid third-party dependencies
- Decision: Use modular architecture to allow easy swap from temporary to production AI backend
- Timeline confirmed: Monday morning delivery

### Key Decisions Made
1. **No third-party AI APIs for prototype**: Use local models (Ollama/HF) from the start
2. **Bilingual is non-negotiable**: Critical for South Texas demographic
3. **Embedded widget design**: Modern UX expectation, differentiator from current solution
4. **GitHub-first approach**: Transparency, version control, professional presentation
5. **Phased delivery**: Prototype proves concept, proposal sells vision

---

## Document Version Control

**Version**: 1.0  
**Last Updated**: January 17, 2025  
**Next Review**: January 20, 2025 (Post-Delivery)

---

*This document is a living guide and will be updated as the project progresses.*
