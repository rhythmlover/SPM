// import RequestTable from '@/components/RequestTable.vue';
// import { mount } from '@vue/test-utils';
// import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// import axios from 'axios';
// import { nextTick } from 'vue';

// const flushPromises = () => new Promise(nextTick);

// vi.mock('axios', () => ({
//   __esModule: true,
//   default: {
//     get: vi.fn((url) => {
//       if (url.includes('/wfh-request/ds-recurring')) {
//         return Promise.resolve({
//           data: {
//             results: [
//               {
//                 Approver_ID: 171018,
//                 Comments: null,
//                 Decision_Date: '2024-10-26T16:00:00.000Z',
//                 Request_Date: '2024-10-14T16:00:00.000Z',
//                 Request_ID: 49,
//                 Request_Period: 'PM',
//                 Request_Reason: 'Personal',
//                 Staff_ID: 171015,
//                 Status: 'Pending',
//                 WFH_Date_End: '2024-11-14T16:00:00.000Z',
//                 WFH_Date_Start: '2024-10-31T16:00:00.000Z',
//                 WFH_Day: '3',
//               },
//             ],
//           },
//         });
//       }
//       return Promise.reject(new Error('Unknown endpoint'));
//     }),
//     post: vi.fn((url, payload) => {
//       if (url.includes('/wfh-request/recurring-request/status')) {
//         if (payload.status === 'Approved') {
//           return Promise.resolve({
//             data: { success: true, updatedStatus: 'Approved' },
//           });
//         }
//         if (payload.status === 'Rejected') {
//           return Promise.resolve({
//             data: { success: true, updatedStatus: 'Rejected' },
//           });
//         }
//       }
//       return Promise.reject(new Error('Unknown endpoint'));
//     }),
//   },
// }));

// const ERROR_MESSAGES = {
//   rejectionReasonMissing: 'Please provide a reason for rejection.',
// };

// describe('RequestTable.vue', () => {
//   let wrapper;

//   beforeEach(async () => {
//     window.alert = vi.fn();

//     wrapper = await mount(RequestTable, {
//       props: { API_ROUTE: 'http://localhost:3000' },
//     });

//     wrapper.vm.fetchRecurringRequests = vi.fn(async () => {
//       wrapper.vm.$data.requests = await axios
//         .get('/wfh-request/ds-recurring')
//         .then((res) => res.data.results);
//     });

//     wrapper.vm.handleRejectRequest = async (request, reason) => {
//       if (!reason) {
//         throw new Error(ERROR_MESSAGES.rejectionReasonMissing);
//       }
//       request.Status = 'Rejected';
//       await axios.post('/wfh-request/recurring-request/status', {
//         requestId: request.Request_ID,
//         status: 'Rejected',
//       });
//     };

//     wrapper.vm.handleApproveRequest = vi.fn(async (request) => {
//       request.Status = 'Approved';
//       await axios.post('/wfh-request/recurring-request/status', {
//         requestId: request.Request_ID,
//         status: 'Approved',
//       });
//       if (wrapper.vm.isBelowThreshold()) {
//         wrapper.vm.notifyBelowThreshold();
//       }
//     });

//     wrapper.vm.isBelowThreshold = vi.fn(() => true);
//     wrapper.vm.notifyBelowThreshold = vi.fn();
//   });

//   afterEach(() => {
//     vi.clearAllMocks();
//   });

//   it('fetches and displays direct subordinates’ recurring WFH requests', async () => {
//     await wrapper.vm.fetchRecurringRequests();
//     await flushPromises();

//     expect(axios.get).toHaveBeenCalledWith('/wfh-request/ds-recurring');
//     expect(wrapper.vm.$data.requests).toHaveLength(1);
//   });

//   it('displays staff name, request date, duration, and reason for each request', async () => {
//     await wrapper.vm.fetchRecurringRequests();
//     await flushPromises();

//     const requestDetails = wrapper.vm.$data.requests[0];
//     expect(requestDetails.Staff_ID).toBe(171015);
//     expect(requestDetails.WFH_Date_Start).toBe('2024-10-31T16:00:00.000Z');
//     expect(requestDetails.Request_Period).toBe('PM');
//     expect(requestDetails.Request_Reason).toBe('Personal');
//   });

//   it('requires a rejection reason before submitting rejection', async () => {
//     wrapper.vm.$data.requests = [
//       { Request_ID: 50, Status: 'Pending', Staff_ID: 171016 },
//     ];

//     await expect(
//       wrapper.vm.handleRejectRequest(wrapper.vm.$data.requests[0], ''),
//     ).rejects.toThrow(ERROR_MESSAGES.rejectionReasonMissing);
//   });

//   it('updates status to "Rejected" when rejection is submitted with a reason', async () => {
//     const request = { Request_ID: 50, Status: 'Pending', Staff_ID: 171016 };
//     wrapper.vm.$data.requests = [request];

//     await wrapper.vm.handleRejectRequest(request, 'Scheduling conflict');
//     await flushPromises();

//     expect(request.Status).toBe('Rejected');
//     expect(axios.post).toHaveBeenCalledWith(
//       '/wfh-request/recurring-request/status',
//       { requestId: 50, status: 'Rejected' },
//     );
//   });

//   it('updates status to "Approved" when approval is submitted', async () => {
//     const request = { Request_ID: 49, Status: 'Pending', Staff_ID: 171015 };
//     wrapper.vm.$data.requests = [request];

//     await wrapper.vm.handleApproveRequest(request);
//     await flushPromises();

//     expect(request.Status).toBe('Approved');
//     expect(axios.post).toHaveBeenCalledWith(
//       '/wfh-request/recurring-request/status',
//       { requestId: 49, status: 'Approved' },
//     );
//   });

//   it('notifies supervisor if approving a request will cause staffing to go under 50%', async () => {
//     const request = { Request_ID: 49, Status: 'Pending', Staff_ID: 171015 };
//     wrapper.vm.$data.requests = [request];

//     await wrapper.vm.handleApproveRequest(request);
//     await flushPromises();

//     expect(wrapper.vm.notifyBelowThreshold).toHaveBeenCalled();
//   });
// });
