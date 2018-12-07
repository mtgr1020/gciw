import Vue from 'vue'
import Router from 'vue-router'
import history from '@/components/history'
import current from '@/components/current'
import entering from '@/components/entering'
import award from '@/components/award'
import RECTest from '@/components/RECTest'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: '',
      component: current
    },{
      path: '/history',
      name: 'history',
      component: history
    },{
      path: '/current',
      name: 'current',
      component: current
    },{
      path: '/entering',
      name: 'entering',
      component: entering
    },{
      path: '/award',
      name: 'award',
      component: award
    },{
      path: '/RECTest',
      name: 'RECTest',
      component: RECTest
    }
  ]
})
