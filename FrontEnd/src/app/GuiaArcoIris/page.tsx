'use client'
import Layout from '../components/Layout/Layout'
import Hero from '../components/Hero/Hero'
import Timeline from '../components/TimeLine/TimeLine'
import Articles from '../components/Articles/Articles'
import Events from '../components/Events/Events'
import ResourceMap from '../components/ResourcesMap/ResourcesMap'
import Chatbot from '../components/ChatBot/ChatBot'
import Profissionais from '../components/Professionals-lgbt/Professionals-lgbt'

export default function Home() {
  return (
    <Layout>
      <Hero />
      <Timeline />
      <ResourceMap />
      <Profissionais />
      <Events />
      <Articles />
      <Chatbot />
    </Layout>
  )
}