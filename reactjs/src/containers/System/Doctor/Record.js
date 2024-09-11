import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManagePatient.scss';
import { getAllPatientsWithStatusS3 } from '../../../services/userService'; // API đã cập nhật để lấy bệnh nhân với trạng thái S3
import { LANGUAGES } from '../../../utils';
import { toast } from 'react-toastify';
import LoadingOverlay from 'react-loading-overlay';
import moment from 'moment'; // Sử dụng moment để định dạng ngày

class ManagePatient extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataPatient: [],               // Dữ liệu danh sách bệnh nhân
            notes: {},                     // Lưu trữ ghi chú cho từng bệnh nhân với patientId làm key
            isShowLoading: false            // Trạng thái hiển thị loading
        }
    }

    async componentDidMount() {
        this.getDataPatient();              // Lấy dữ liệu khi component được mount
    }

    // Gọi API lấy danh sách bệnh nhân đã khám (S3)
    getDataPatient = async () => {
        let { user } = this.props;
        this.setState({ isShowLoading: true });
        try {
            let res = await getAllPatientsWithStatusS3({
                doctorId: user.id
            });
            if (res && res.errCode === 0) {
                this.setState({
                    dataPatient: res.data,
                    isShowLoading: false
                });
            } else {
                this.setState({
                    isShowLoading: false
                });
                toast.error('Failed to fetch patient data.');
            }
        } catch (error) {
            console.error('Error:', error);
            this.setState({
                isShowLoading: false
            });
        }
    }

    // Xử lý khi bác sĩ thay đổi ghi chú
    handleNoteChange = (event, patientId) => {
        let notes = { ...this.state.notes };  // Lấy tất cả các note hiện tại
        notes[patientId] = event.target.value;  // Cập nhật note cho bệnh nhân với patientId cụ thể
        this.setState({
            notes: notes  // Cập nhật lại state với ghi chú mới
        });
    }

    render() {
        let { dataPatient, notes } = this.state;
        let { language } = this.props;

        return (
            <>
                <LoadingOverlay
                    active={this.state.isShowLoading}
                    spinner
                    text='Loading...'
                >
                    <div className="manage-patient-container">
                        <div className="m-p-title">
                            Quản lý bệnh nhân đã khám
                        </div>
                        <div className="manage-patient-body row">
                            <div className="col-12 table-manage-patient">
                                <table style={{ width: '100%' }}>
                                    <tbody>
                                        <tr>
                                            <th>STT</th>
                                            <th>Ngày khám</th>
                                            <th>Họ và tên</th>
                                            <th>Địa chỉ</th>
                                            <th>Giới tính</th>
                                            <th>Note</th>
                                        </tr>
                                        {dataPatient && dataPatient.length > 0 ?
                                            dataPatient.map((item, index) => {
                                                // Định dạng ngày và thời gian khám
                                                let formattedDate = moment(parseInt(item.date)).format('DD/MM/YYYY');
                                                let timeSlot = language === LANGUAGES.VI ? 
                                                    item.timeTypeDataPatient.valueVi : item.timeTypeDataPatient.valueEn;
                                                let gender = language === LANGUAGES.VI ?
                                                    item.patientData.genderData.valueVi : item.patientData.genderData.valueEn;
                                                
                                                return (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{formattedDate} {timeSlot}</td>
                                                        <td>{item.patientData.firstName}</td>
                                                        <td>{item.patientData.address}</td>
                                                        <td>{gender}</td>
                                                        <td>
                                                            <textarea
                                                                placeholder="Ghi chú của bác sĩ"
                                                                value={notes[item.patientId] || ''} // Hiển thị ghi chú cụ thể cho từng bệnh nhân
                                                                onChange={(event) => this.handleNoteChange(event, item.patientId)} // Cập nhật theo patientId
                                                                className="note-input"
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                            :
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </LoadingOverlay>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,        // Lấy ngôn ngữ từ Redux
        user: state.user.userInfo,           // Lấy thông tin người dùng từ Redux
    };
};

const mapDispatchToProps = dispatch => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManagePatient);
