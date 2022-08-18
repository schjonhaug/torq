package settings

import (
	"github.com/cockroachdb/errors"
	"github.com/jmoiron/sqlx"
)

type ConnectionDetails struct {
	LocalNodeId       int
	GRPCAddress       string
	TLSFileBytes      []byte
	MacaroonFileBytes []byte
}

func GetConnectionDetails(db *sqlx.DB) ([]ConnectionDetails, error) {
	localNodes, err := getLocalNodeConnectionDetails(db)
	if err != nil {
		return []ConnectionDetails{}, err
	}
	connectionDetailsList := []ConnectionDetails{}

	for _, localNodeDetails := range localNodes {
		if (localNodeDetails.GRPCAddress == nil) || (localNodeDetails.TLSDataBytes == nil) || (localNodeDetails.
			MacaroonDataBytes == nil) {
			continue
		}
		connectionDetailsList = append(connectionDetailsList, ConnectionDetails{
			LocalNodeId:       localNodeDetails.LocalNodeId,
			GRPCAddress:       *localNodeDetails.GRPCAddress,
			TLSFileBytes:      localNodeDetails.TLSDataBytes,
			MacaroonFileBytes: localNodeDetails.MacaroonDataBytes})
	}
	if len(connectionDetailsList) == 0 {
		return []ConnectionDetails{}, errors.New("Missing node details")
	}
	return connectionDetailsList, nil
}
