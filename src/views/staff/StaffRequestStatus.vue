<template>
  <div class="about">
    <div>
      <h1>Staff Work Arrangement Request Status</h1>
      <table>
        <thead>
          <tr>
            <th>Request Type</th>
            <th>Requested Date</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>WFH</td>
            <td>23/9/2024</td>
            <td><span class="status approved">Approved</span></td>
            <td></td>
          </tr>
          <tr>
            <td>In Office</td>
            <td>24/9/2024</td>
            <td><span class="status pending">Pending</span></td>
            <td></td>
          </tr>
          <tr>
            <td>WFH</td>
            <td>25/9/2024</td>
            <td><span class="status rejected">Rejected</span></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    padding: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    table-layout: fixed;
  }

  th, td {
    padding: 12px 15px;
    text-align: left;
    border: 1px solid #ddd;
    word-wrap: break-word;
  }

  th {
    background-color: #f4f4f4;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }

  /* Status tag styling */
  .status {
    padding: 5px 10px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
  }

  /* Approved status tag */
  .approved {
    background-color: #4CAF50; /* Green */
  }

  /* Pending status tag */
  .pending {
    background-color: #FFC107; /* Yellow */
  }

  /* Rejected status tag */
  .rejected {
    background-color: #F44336; /* Red */
  }
}
</style>

