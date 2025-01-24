import { useEffect, useState } from 'react';
import {
    TableCustom as Table,
    Button,
    ConfirmModal,
    Loader
} from '../../component';
import { toast } from 'react-toastify';
import { getReviews } from '../../api/ReviewManagement';

function BoardingHouseReviewManagement() {
    // cột của bảng 
    const columns = [
        {
            title: 'Boarding House Name',
            dataIndex: 'boardingHouseId',
            key: 'boardingHouseId',
            render: (house) => house?.name || 'N/A',
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Rating',
            dataIndex: 'rating',
            key: 'rating',
            render: (rating) => (
                <span style={{ color: [rating] }}>
                    {rating} / 5
                </span>
            ),
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('en-GB'),
        },
        {
            title: 'Reviewer',
            dataIndex: 'accountId',
            key: 'accountId',
            render: (account) => account?.username || 'N/A',
        },
        {
            title: 'Action',
            render: (record) => (
                <Button
                    title={'Delete'}
                    btnDelete
                    className="btn-delete"
                    onClick={() => handleDeleteModal(record)}
                >
                    Delete
                </Button>
            ),
        },
    ];

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    // hàm lấy data
    const fetchData = async () => {
        try {
            const res = await getReviews();
            if (res && res.data) {
                setData(res.data);
                console.log(res);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            toast.error('Failed to fetch reviews. Please try again later.');
        }
    };

    const handleDeleteModal = (record) => {
        setSelectedReview(record);
        setIsOpenDeleteModal(true);
    };

    //thêm hàm delete đây
    const handleDelete = async () => {

    };

    useEffect(() => {
        setLoading(true);
        fetchData().finally(() => {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        });
    }, []);

    return (
        <div className="txt">
            {loading ? (
                <Loader />
            ) : (
                <>
                    <div className="flex justify-between mb-4">
                        <Button
                            size="large"
                            onClick={() => toast.success('Add success')}
                            btnAdd
                            title={'Add new'}
                        >
                            Add new
                        </Button>
                        <Button
                            btnFilter
                            size="large"
                            onClick={() => toast.success('Filter success')}
                            title={'Filter'}
                        >
                            Filter
                        </Button>
                    </div>
                    <div>
                        <Table
                            columns={columns}
                            data={data}
                            loading={loading}
                        />
                    </div>
                    <ConfirmModal
                        title="Confirm Deletion"
                        content="Do you want to delete this review?"
                        onOk={handleDelete}
                        onCancel={() => setIsOpenDeleteModal(false)}
                        isOpen={isOpenDeleteModal}
                    />
                </>
            )}
        </div>
    );
}

export default BoardingHouseReviewManagement;