import React, { Component } from 'react';
import { connect } from "react-redux";
import './Deposit.scss';
import { getDepositInfo } from '../../../services/userService';
import HomeHeader from '../../HomePage/HomeHeader';

class Deposit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            appointmentId: null, // Để lưu appointmentId được truyền qua URL
            depositAmount: '', // Số tiền đặt cọc
            depositInfo: null, // Dữ liệu đặt cọc từ API
            loading: true, // Trạng thái tải dữ liệu
            error: null // Lỗi nếu có
        };
    }

    async componentDidMount() {
        // Lấy appointmentId từ URL params
        const { appointmentId } = this.props.match.params;
        this.setState({ appointmentId });

        try {
            let response = await getDepositInfo(appointmentId);
            if (response && response.data.errCode === 0) {
                const depositInfo = response.data.data[0]; // Lấy phần tử đầu tiên của mảng data
                const price = parseFloat(depositInfo.doctorBooking.priceTypeData.valueVi.replace(/,/g, '')); // Chuyển giá thành số và loại bỏ dấu phân cách ngàn
                const depositAmount = (price / 2).toFixed(0); // Tính số tiền cọc và làm tròn số

                this.setState({ 
                    depositInfo,
                    depositAmount,
                    loading: false 
                });
            } else {
                this.setState({ 
                    error: response.data.errMessage || 'Error retrieving data',
                    loading: false 
                });
            }
        } catch (error) {
            console.log('Error fetching appointments:', error);
            this.setState({ 
                error: 'Failed to fetch deposit information',
                loading: false 
            });
        }
    }

    handleDepositChange = (event) => {
        this.setState({ depositAmount: event.target.value });
    };

    handleSubmit = (event) => {
        event.preventDefault();
        const { appointmentId, depositAmount } = this.state;
        console.log(`Đặt cọc cho lịch hẹn ${appointmentId} với số tiền ${depositAmount}`);

        // Thêm logic gọi API thực hiện việc đặt cọc ở đây
    };

    render() {
        const { appointmentId, depositAmount, depositInfo, loading, error } = this.state;

        if (loading) {
            return <div className="loading">Loading...</div>;
        }

        if (error) {
            return <div className="error">Error: {error}</div>;
        }

        return (
            <>
            <HomeHeader />
            <div className="deposit-container">
                <header className="deposit-header">
                    <h1>Thông tin đặt cọc</h1>
                </header>
                <div className="deposit-content">
                    <h2>Đặt cọc cho lịch hẹn #{appointmentId}</h2>
                    {depositInfo && depositInfo.doctorBooking && (
                        <div className="deposit-info">
                            <p><strong>Thông tin bác sĩ:</strong></p>
                            <p>Tên phòng khám: {depositInfo.doctorBooking.nameClinic}</p>
                            <p>Địa chỉ phòng khám: {depositInfo.doctorBooking.addressClinic}</p>
                            <p>Giá: {depositInfo.doctorBooking.priceTypeData?.valueVi} VND</p>
                            <p><strong>Số tiền đặt cọc (50%): {depositAmount} VND</strong></p>
                        </div>
                    )}
                    <form onSubmit={this.handleSubmit} className="deposit-form">
                        <label>Số tiền đặt cọc:</label>
                        <p>{depositAmount} VND</p> {/* Hiển thị số tiền cọc */}
                        <button type="submit">Xác nhận đặt cọc</button>
                    </form>
                </div>
            </div></>
        );
    }
}

const mapStateToProps = state => {
    return {
        language: state.app.language,
    };
};

const mapDispatchToProps = dispatch => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Deposit);
