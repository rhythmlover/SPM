import { mount } from '@vue/test-utils';
import RequestRow from '@/components/RequestRow.vue';
import StatusButton from '@/components/StatusButton.vue';
import { describe, it, expect } from 'vitest';
import { updateSheet } from '../../../updateGoogleSheet';

describe('RequestRow.vue', () => {
    const request = {
        Staff_FName: 'John',
        Staff_LName: 'Doe',
        Request_Reason: 'Personal',
        WFH_Date: '2023-09-01',
        Request_Date: '2023-08-25T10:00:00',
        Request_ID: 1,
        Approval_Comments: 'Not applicable'
    };

    it('should display staff full name', async () => {
        const testId = 'TC-007';
        try {
            const wrapper = mount(RequestRow, {
                props: { request, status: 'pending' }
            });
            const nameText = wrapper.find('td.col-2').text();
            expect(nameText).toContain('John Doe');
            await updateSheet(testId, 'Passed');
        } catch (error) {
            await updateSheet(testId, 'Failed');
            throw error;
        }
    });

    it('should display the correct reason', async () => {
        const testId = 'TC-008';
        try {
            const wrapper = mount(RequestRow, {
                props: { request, status: 'pending' }
            });
            const reasonText = wrapper.findAll('td.col-4').at(0).text();
            expect(reasonText).toBe('Personal');
            await updateSheet(testId, 'Passed');
        } catch (error) {
            await updateSheet(testId, 'Failed');
            throw error;
        }
    });

    it('should format the request date correctly', async () => {
        const testId = 'TC-009';
        try {
            const wrapper = mount(RequestRow, {
                props: { request, status: 'pending' }
            });
            const formattedDate = wrapper.findAll('td.col-2').at(2).text();
            expect(formattedDate).toContain('August 25, 2023 (Friday)');
            await updateSheet(testId, 'Passed');
        } catch (error) {
            await updateSheet(testId, 'Failed');
            throw error;
        }
    });

    it('should emit updateRequestStatus with "Approved" when accept button is clicked', async () => {
        const testId = 'TC-010';
        try {
            const wrapper = mount(RequestRow, {
                props: { request, status: 'pending' },
                components: { StatusButton }
            });
            await wrapper.find('button.btn-success').trigger('click');
            expect(wrapper.emitted().updateRequestStatus[0]).toEqual([1, 'Approved']);
            await updateSheet(testId, 'Passed');
        } catch (error) {
            await updateSheet(testId, 'Failed');
            throw error;
        }
    });

    it('should emit updateRequestStatus with "Rejected" when reject button is clicked', async () => {
        const testId = 'TC-011';
        try {
            const wrapper = mount(RequestRow, {
                props: { request, status: 'pending' },
                components: { StatusButton }
            });
            await wrapper.find('button.btn-danger').trigger('click');
            expect(wrapper.emitted().updateRequestStatus[0]).toEqual([1, 'Rejected']);
            await updateSheet(testId, 'Passed');
        } catch (error) {
            await updateSheet(testId, 'Failed');
            throw error;
        }
    });

    it('should emit updateRequestStatus with "Withdrawn" when withdraw button is clicked', async () => {
        const testId = 'TC-012';
        try {
            const wrapper = mount(RequestRow, {
                props: { request, status: 'accepted' },
                components: { StatusButton }
            });
            await wrapper.find('button.btn-outline-success').trigger('click');
            expect(wrapper.emitted().updateRequestStatus[0]).toEqual([1, 'Withdrawn']);
            await updateSheet(testId, 'Passed');
        } catch (error) {
            await updateSheet(testId, 'Failed');
            throw error;
        }
    });

    it('should display the request comments if status is rejected', async () => {
        const testId = 'TC-013';
        try {
            const wrapper = mount(RequestRow, {
                props: { request, status: 'rejected' }
            });
            const commentText = wrapper.findAll('td.col-2').at(3).text();
            expect(commentText).toBe('Not applicable');
            await updateSheet(testId, 'Passed');
        } catch (error) {
            await updateSheet(testId, 'Failed');
            throw error;
        }
    });

    it('should not display action buttons if status is rejected', async () => {
        const testId = 'TC-014';
        try {
            const wrapper = mount(RequestRow, {
                props: { request, status: 'rejected' }
            });
            const buttons = wrapper.findAllComponents(StatusButton);
            expect(buttons.length).toBe(0);
            await updateSheet(testId, 'Passed');
        } catch (error) {
            await updateSheet(testId, 'Failed');
            throw error;
        }
    });
});
