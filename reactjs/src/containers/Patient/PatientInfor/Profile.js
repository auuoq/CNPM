import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Profile.scss';
import HomeHeader from '../../HomePage/HomeHeader';
import { getUserInfoByEmail } from '../../../services/userService';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userData: null, // Dữ liệu người dùng
            loading: true // Hiển thị trạng thái loading
        };
    }

    async componentDidMount() {
        const { userInfo } = this.props;

        if (userInfo && userInfo.email) {
            try {
                let response = await getUserInfoByEmail(userInfo.email);
                if (response && response.errCode === 0) {
                    this.setState({
                        userData: response.data,
                        loading: false
                    });
                } else {
                    this.setState({
                        loading: false
                    });
                }
            } catch (error) {
                console.log('Error fetching user info:', error);
                this.setState({ loading: false });
            }
        }
    }

    render() {
        const { userData, loading } = this.state;

        if (loading) {
            return <p>Loading...</p>;
        }

        if (!userData) {
            return <p>Không tìm thấy thông tin người dùng</p>;
        }

        return (
            <>
                <HomeHeader />
                <div className="profile-container">
                    <h1>Thông tin cá nhân</h1>
                    <p><strong>Email: </strong>{userData.email}</p>
                    <p><strong>Họ và tên: </strong>{userData.firstName} {userData.lastName}</p>
                    <p><strong>Địa chỉ: </strong>{userData.address}</p>
                    <p><strong>Giới tính: </strong>{userData.gender}</p>
                    <p><strong>Số điện thoại: </strong>{userData.phonenumber}</p>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        userInfo: state.user.userInfo // Thông tin của người dùng đã đăng nhập
    };
};

export default connect(mapStateToProps)(Profile);
