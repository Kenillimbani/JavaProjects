import React, { Fragment, Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Input } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';

import Header from '../common/Header';
import Menus from '../common/Menus';
import { isAuth, AxiosHelper } from '../authentication/Helpers';
import { RESOURCE_BASE_URL } from '../../base_url';

class Cars extends Component {

  constructor(props) {
    super(props);
    this.state = {
      search_term: "",
      user_id: "",
      driversList: [],
      is_active: "",
      vehiclesListData: [],
      selectedVehicles: []
    }
    this.handleSearchFilter = this.handleSearchFilter.bind(this);
    this.handleDriverChangeOption = this.handleDriverChangeOption.bind(this);
    this.handleIsActiveOption = this.handleIsActiveOption.bind(this);
    // this.handleVehicleStatusChange = this.handleVehicleStatusChange.bind(this);
    this.handleCheckBoxChange = this.handleCheckBoxChange.bind(this);
    this.handleDocumentOpenClick = this.handleDocumentOpenClick.bind(this);
    this.handleDeleteVehicle = this.handleDeleteVehicle.bind(this);
  }

  async componentDidMount() {
    this.getVehicles({});
    let res = await AxiosHelper('drivers/names_list', 'POST', {})
    this.setState({ driversList: res.data.data });
  }

  async getVehicles(data) {
    let res = await AxiosHelper('vehicles/list', 'POST', data);
    if (res.data.data && res.data.data.length !== 0) {
      let newData = res.data.data.map(vehicle => ({ ...vehicle, isChecked: false }));
      this.setState({ vehiclesListData: newData });
    } else {
      this.setState({ vehiclesListData: [] });
    }
  }

  handleSearchFilter(e) {
    this.setState({ [e.target.name]: e.target.value }, () => {
      let data = this.state.search_term ? { search_term: this.state.search_term } : {}
      this.getVehicles(data);
    });
  }
  handleDriverChangeOption(e) {
    this.setState({ [e.target.name]: e.target.value }, () => {
      this.getVehicles({ user_id: this.state.user_id });
    });
  }
  handleIsActiveOption(e) {
    this.setState({ [e.target.name]: e.target.value }, () => {
      this.getVehicles({ is_active: this.state.is_active });
    });
  }

  handleCheckBoxChange(vehicleObject, vehicle) {
    let newData = this.state.vehiclesListData.map(v => {
      return v.vehicle_id === vehicleObject.vehicle_id ? { ...v, isChecked: !v.isChecked } : v;
    });
    this.setState({ vehiclesListData: newData });
    if (this.state.selectedVehicles.some(v => v.vehicle_id === vehicle.vehicle_id)) {
      this.setState({ selectedVehicles: this.state.selectedVehicles.filter(v => v.vehicle_id !== vehicle.vehicle_id) });
    } else {
      this.setState({ selectedVehicles: [...this.state.selectedVehicles, vehicle] });
    }
  }

  // async vehicleStatusChange(data) {
  //   let res = await AxiosHelper('vehicles/change_status', 'POST', data);
  //   if (res.error) {
  //     toast.error(res.message);
  //     return 0;
  //   } else {
  //     if (res.data.error) {
  //       toast.error(res.data.message);
  //       return 0;
  //     } else {
  //       this.getVehicles({});
  //       return 1;
  //     }
  //   }
  // }
  // handleVehicleStatusChange() {
  //   let successFlag = 0;
  //   if (this.state.selectedVehicles.length !== 0) {
  //     this.state.selectedVehicles.forEach(vehicle => {
  //       vehicle.is_active = vehicle.is_active === 0 ? 1 : 0;
  //       successFlag = this.vehicleStatusChange(vehicle);
  //     });
  //     if (successFlag) {
  //       this.setState({ selectedVehicles: [] });
  //       toast.success("Vehicle's Status Changed Successfully.");
  //     }
  //   } else {
  //     toast.error("Please select Vehicle to change status.");
  //   }
  // }

  async handleChangeStatusOption(i, vehicle_id, e) {
    let vehicles = this.state.vehiclesListData.slice();
    vehicles[i] = { ...vehicles[i], is_active: parseInt(e.target.value) };
    this.setState({ vehiclesListData: vehicles });
    let res = await AxiosHelper('vehicles/change_status', 'POST', { vehicle_id, is_active: parseInt(e.target.value) });
    if (res.data.error) {
      toast.error("Something went wrong.");
    } else {
      toast.success("Vehicle's Status updated successfully.");
    }
    this.getVehicles({});
  }

  handleDocumentOpenClick(path) {
    if (path) {
      window.open(RESOURCE_BASE_URL + path, "_blank");
    }
  }

  async deleteVehicle(data) {
    let res = await AxiosHelper('vehicles/delete', 'POST', data);
    if (res.error) {
      toast.error(res.message);
      return 0;
    } else {
      if (res.data.error) {
        toast.error(res.data.message);
        return 0;
      } else {
        this.getVehicles({});
        return 1;
      }
    }
  }
  handleDeleteVehicle() {
    let successFlag = 0;
    if (this.state.selectedVehicles.length !== 0) {
      this.state.selectedVehicles.forEach(vehicle => {
        successFlag = this.deleteVehicle({ vehicle_id: vehicle.vehicle_id });
      });
      if (successFlag) {
        this.setState({ selectedVehicles: [] });
        toast.success("Vehicle Deleted Successfully.");
      }
    } else {
      toast.error("Please select Vehicle to Delete.");
    }
  }

  render() {

    if (!isAuth()) {
      return <Redirect to="/signin" />
    }

    return (
      <Fragment>
        <ToastContainer />
        <div className="heivh">
          <Header></Header>
          <div className="bot-wrap">
            <Menus></Menus>
            <div className="right-wrap-content">
              <div className="hei100">
                <div className="row hei100">
                  <div className="col-md-12 hei100">
                    <div className="hei100 right-bg bor-rad-25">
                      <div className="pad-arrund">
                        <div className="member-table">
                          <div className="member-table-top">
                            <div className="d-flex align-items-center justify-content-center hei100">
                              <div className="wrapper">
                                <div>
                                  <div className="gray_select_ser_rqst mar-left-10">
                                    <input type="text" className="tab-input mar-0"
                                      name="search_term"
                                      onChange={this.handleSearchFilter}
                                    />
                                  </div>
                                  <label htmlFor="" className="driver_label">User</label>
                                  <div className="gray_select_ser_rqst mar-left-10">
                                    <Input type="select" className="grey-select"
                                      name="user_id"
                                      value={this.state.user_id}
                                      onChange={this.handleDriverChangeOption}
                                    >
                                      <option value="">Select User</option>
                                      {
                                        this.state.driversList && this.state.driversList.length !== 0
                                          ? this.state.driversList.map(driver => {
                                            return (
                                              <option key={driver.user_id} value={driver.user_id}>
                                                {driver.firstname + " " + driver.lastname}
                                              </option>
                                            )
                                          })
                                          : <option value="">No Drivers</option>
                                      }
                                    </Input>
                                  </div>
                                  <label htmlFor="" className="driver_label">Status</label>
                                  <div className="gray_select_ser_rqst mar-left-10">
                                    <Input type="select" className="grey-select"
                                      name="is_active"
                                      value={this.state.is_active}
                                      onChange={this.handleIsActiveOption}
                                    >
                                      <option value="">Select Status</option>
                                      <option value="0">Pending</option>
                                      <option value="1">Approved</option>
                                      <option value="2">Rejected</option>
                                    </Input>
                                  </div>
                                  <div className="gray_select_ser_rqst mar-left-10">
                                    <button className="tab-update-btn">Pending</button>
                                    <span className="pen-span">
                                      {
                                        this.state.vehiclesListData && this.state.vehiclesListData.length !== 0
                                          ? this.state.vehiclesListData.filter(v => v.is_active === 0).length
                                          : 0
                                      }
                                    </span>
                                  </div>

                                  {/* <div className="gray_select_ser_rqst">
                                    <button className="tab-update-btn" data-toggle="modal" data-target="#basicExampleModal-2">Change Status</button>
                                  </div>
                                  <div className="modal fade" id="basicExampleModal-2" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div className="modal-dialog" role="document">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h5 className="modal-title" id="exampleModalLabel">Are you Sure you want to Change Status?</h5>
                                          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                          </button>
                                        </div>
                                        <div className="modal-body">
                                          <br />
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                          <button type="button" className="invite-btn bg-red" data-dismiss="modal" aria-label="Close">No</button>
                                            &nbsp;&nbsp;  
                                          <button type="button" onClick={this.handleVehicleStatusChange} data-dismiss="modal" className="invite-btn">Yes</button>
                                        </div>
                                        <div className="modal-footer"></div>
                                      </div>
                                    </div>
                                  </div> */}

                                  <div className="gray_select_ser_rqst mar-left-10">
                                    <button className="tab-update-btn bg-red" data-toggle="modal" data-target="#basicExampleModal-1">Delete</button>
                                  </div>
                                  <div className="modal fade" id="basicExampleModal-1" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div className="modal-dialog" role="document">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h5 className="modal-title" id="exampleModalLabel">Are you Sure you want to Delete Vehicle?</h5>
                                          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                          </button>
                                        </div>
                                        <div className="modal-body">
                                          <br />
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center">
                                          <button type="button" className="invite-btn bg-red" data-dismiss="modal" aria-label="Close">No</button>
                                            &nbsp;&nbsp;
                                          <button type="button" onClick={this.handleDeleteVehicle} data-dismiss="modal" className="invite-btn">Yes</button>
                                        </div>
                                        <div className="modal-footer"></div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* <div className="modal fade" id="basicExampleModal-2" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                    <div className="modal-dialog" role="document">
                                      <div className="modal-content">
                                        <div className="modal-header">
                                          <h5 className="modal-title" id="exampleModalLabel">Reject Message</h5>
                                          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                          </button>
                                        </div>
                                        <div className="modal-body">
                                          <label htmlFor="" className="mem-tab-title">Email</label>
                                          <input className="mem-tab-input" type="text" />
                                          <label htmlFor="" className="mem-tab-title">Phone</label>
                                          <input className="mem-tab-input" type="text" />
                                          <label htmlFor="" className="mem-tab-title">Subject</label>
                                          <textarea name="" id="" className="mem-tab-input" cols="30" rows="4"></textarea>
                                        </div>
                                        <div className="modal-footer">
                                          <button type="button" className="invite-btn bg-red" data-dismiss="modal" aria-label="Close">No</button>
                                            &nbsp;&nbsp;
                                          <button type="button" className="invite-btn">Yes</button>
                                        </div>
                                      </div>
                                    </div>
                                  </div> */}

                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="member-table-bot">
                            <div className="mem_table">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th scope="col">Make</th>
                                    <th scope="col">Modal</th>
                                    <th scope="col">User</th>
                                    <th scope="col">Vehicle ID</th>
                                    <th scope="col">Vin</th>
                                    <th scope="col">ODO</th>
                                    <th scope="col">Rego</th>
                                    <th scope="col">CTP</th>
                                    <th scope="col">Insurance</th>
                                    <th scope="col">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {
                                    this.state.vehiclesListData && this.state.vehiclesListData.length !== 0
                                      ? this.state.vehiclesListData.map((vehicle, index) => {
                                        return (
                                          <tr key={vehicle.vehicle_id}>
                                            <td>
                                              <div className="count-num">
                                                <label className="container-check" style={{ display: "inline" }}>
                                                  <input type="checkbox"
                                                    checked={vehicle.isChecked}
                                                    onChange={() => this.handleCheckBoxChange(vehicle, {
                                                      vehicle_id: vehicle.vehicle_id,
                                                      is_active: vehicle.is_active
                                                    })}
                                                  />
                                                  <span className="checkmark"></span>
                                                </label>
                                                &nbsp; &nbsp;
                                                <div className="pos-rel">
                                                  <img className="name_size_1"
                                                    src={vehicle.profile_picture ? RESOURCE_BASE_URL + vehicle.profile_picture : "./admin/img/profile.jpg"}
                                                    alt=""
                                                  />
                                                  <span className="noti-span">11</span>
                                                </div>
                                                {vehicle.vehicle_company_name || ""}
                                              </div>
                                            </td>
                                            <td>{vehicle.vehicle_models_name || ""}</td>
                                            <td>
                                              <img className="name_size_1"
                                                src={vehicle.profile_picture ? RESOURCE_BASE_URL + vehicle.profile_picture : "./admin/img/profile.jpg"}
                                                alt=""
                                              />
                                              {vehicle.firstname || ""}{" "}{vehicle.lastname || ""}
                                            </td>
                                            <td>V11f45</td>
                                            <td>1125489</td>
                                            <td>{vehicle.vehicle_odo / 1000 || 0}{" K"}</td>
                                            <td>23 Nov 20 &nbsp;
                                              <img className="wid-20"
                                                src="./admin/img/notes.png" alt=""
                                                onClick={() => this.handleDocumentOpenClick(vehicle.registration_document)}
                                                style={{ cursor: "pointer" }}
                                              />
                                            </td>
                                            <td>
                                              <img className="wid-20"
                                                src="./admin/img/notes.png" alt=""
                                                onClick={() => this.handleDocumentOpenClick(vehicle.anti_bacterial_document)}
                                                style={{ cursor: "pointer" }}
                                              />
                                            </td>
                                            <td>
                                              <img className="wid-20"
                                                src="./admin/img/notes.png" alt=""
                                                onClick={() => this.handleDocumentOpenClick(vehicle.insurance_document)}
                                                style={{ cursor: "pointer" }}
                                              />
                                            </td>
                                            <td>
                                              <div className="gray_select_ser_rqst mar-left-10">
                                                <Input type="select" className="grey-select"
                                                  value={vehicle.is_active || 0}
                                                  onChange={(e) => this.handleChangeStatusOption(index, vehicle.vehicle_id, e)}
                                                >
                                                  <option value="0">Pending</option>
                                                  <option value="1">Approved</option>
                                                  <option value="2">Rejected</option>
                                                </Input>
                                              </div>
                                              {/* {vehicle.is_active == 0
                                                ? <span className="notification bg-warning">Pending</span>
                                                : vehicle.is_active == 1
                                                  ? <span className="notification">Active</span>
                                                  : <span className="notification bg-red">Suspended</span>
                                              } */}
                                            </td>
                                          </tr>
                                        )
                                      })
                                      : <tr><td colSpan="10">No Vehicles</td></tr>
                                  }
                                  {/* <tr>
                                    <td>
                                      <div className="count-num">
                                        <label className="container-check" style={{ display: "inline" }}>
                                          <input type="checkbox" /> <span className="checkmark"></span>
                                        </label>
                                          &nbsp; &nbsp;
                                          <div className="pos-rel">
                                          <img className="name_size_1" src="./admin/img/profile.jpg" alt="" />
                                          <span className="noti-span">11</span>
                                        </div>
                                        Toyota
                                      </div>
                                    </td>
                                    <td>F 41</td>
                                    <td><img className="name_size_1" src="./admin/img/profile.jpg" alt="" /> Benny Laven</td>
                                    <td>V11f45</td>
                                    <td>1125489</td>
                                    <td>37 k</td>
                                    <td><span className="notification">Active </span></td>
                                    <td>23 Nov 20 &nbsp; <img className="wid-20" src="./admin/img/notes.png" alt="" /></td>
                                    <td><img className="wid-20" src="./admin/img/notes.png" alt="" /></td>
                                    <td><img className="wid-20" src="./admin/img/notes.png" alt="" /></td>
                                  </tr>
                                  <tr>
                                    <td>
                                      <div className="count-num">
                                        <label className="container-check" style={{ display: "inline" }}>
                                          <input type="checkbox" /> <span className="checkmark"></span>
                                        </label>
                                        &nbsp; &nbsp;
                                        <div className="pos-rel">
                                          <img className="name_size_1" src="./admin/img/profile.jpg" alt="" />
                                          <span className="noti-span">11</span>
                                        </div>
                                        Toyota
                                      </div>
                                    </td>
                                    <td>F 41</td>
                                    <td><img className="name_size_1" src="./admin/img/profile.jpg" alt="" /> Benny Laven</td>
                                    <td>V11f45</td>
                                    <td>1125489</td>
                                    <td>37 k</td>
                                    <td><span className="notification bg-red">Suspended</span></td>
                                    <td>23 Nov 20 &nbsp; <img className="wid-20" src="./admin/img/notes.png" alt="" /></td>
                                    <td><img className="wid-20" src="./admin/img/notes.png" alt="" /></td>
                                    <td><img className="wid-20" src="./admin/img/notes.png" alt="" /></td>
                                  </tr> */}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
};

export default Cars;